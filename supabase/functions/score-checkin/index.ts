import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type CheckInRecord = {
  id: string;
  mother_id: string;
  bp_systolic: number;
  bp_diastolic: number;
  blood_sugar: number;
  body_temp: number;
  heart_rate: number;
  symptoms: string[] | null;
  notes: string | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: CheckInRecord;
};

Deno.serve(async (request) => {
  const payload = (await request.json()) as WebhookPayload;
  const record = payload.record;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const mlServiceUrl = Deno.env.get("ML_SERVICE_URL") ?? "";

  if (!supabaseUrl || !serviceRoleKey || !mlServiceUrl) {
    return new Response(JSON.stringify({ error: "Missing required environment variables" }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const motherResponse = await supabase
    .from("mothers")
    .select("id, age, gestational_age, clinic_id, name")
    .eq("id", record.mother_id)
    .single();

  if (motherResponse.error || !motherResponse.data) {
    return new Response(JSON.stringify({ error: "Mother not found" }), { status: 404 });
  }

  const scoreResponse = await fetch(`${mlServiceUrl}/score/checkin`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      age: motherResponse.data.age,
      gestationalAgeWeeks: motherResponse.data.gestational_age,
      bpSystolic: record.bp_systolic,
      bpDiastolic: record.bp_diastolic,
      bloodSugar: record.blood_sugar,
      bodyTemp: record.body_temp,
      heartRate: record.heart_rate,
      symptoms: record.symptoms ?? [],
      notes: record.notes
    })
  });

  if (!scoreResponse.ok) {
    return new Response(JSON.stringify({ error: "ML service scoring failed" }), { status: 502 });
  }

  const result = await scoreResponse.json();

  await supabase
    .from("checkins")
    .update({
      risk_score: result.score,
      risk_level: result.level
    })
    .eq("id", record.id);

  if (result.level === "High") {
    await supabase.from("alerts").insert({
      mother_id: record.mother_id,
      clinic_id: motherResponse.data.clinic_id,
      alert_type: "maternal_risk",
      message: `${motherResponse.data.name} needs urgent review: ${result.reasons.join(", ")}`,
      is_read: false
    });
  }

  return new Response(JSON.stringify({ ok: true, result }), {
    headers: { "content-type": "application/json" }
  });
});

