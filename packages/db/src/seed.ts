import { db, pool } from "./index";
import { clinicsTable, mothersTable, checkinsTable, alertsTable } from "./schema/index";

async function seed() {
  const [clinic] = await db
    .insert(clinicsTable)
    .values({ name: "Dhaka North Maternal Clinic", location: "Dhaka, Bangladesh", contact: "+880-1700-000000" })
    .returning();

  const mothersData = [
    { name: "Fatima Rahman", age: 27, gestationalAge: 32, dueDate: "2026-09-12" },
    { name: "Nasrin Akter", age: 22, gestationalAge: 18, dueDate: "2026-11-30" },
    { name: "Shirin Sultana", age: 34, gestationalAge: 36, dueDate: "2026-08-05" },
  ];

  for (const data of mothersData) {
    const [mother] = await db
      .insert(mothersTable)
      .values({ ...data, clinicId: clinic.id })
      .returning();

    const [checkin] = await db
      .insert(checkinsTable)
      .values({
        motherId: mother.id,
        bpSystolic: data.name === "Shirin Sultana" ? 152 : 118,
        bpDiastolic: data.name === "Shirin Sultana" ? 98 : 76,
        bloodSugar: 6.4,
        bodyTemp: 36.9,
        heartRate: 82,
        symptoms: data.name === "Shirin Sultana" ? ["swelling", "headache"] : [],
        riskScore: data.name === "Shirin Sultana" ? 0.88 : 0.12,
        riskLevel: data.name === "Shirin Sultana" ? "high" : "low",
      })
      .returning();

    if (checkin.riskLevel === "high") {
      await db.insert(alertsTable).values({
        motherId: mother.id,
        clinicId: clinic.id,
        alertType: "maternal_risk",
        message: `High risk vitals detected for ${mother.name}: bp systolic high, bp diastolic high`,
        isRead: false,
      });
    }
  }

  console.log("Seed complete. Clinic id:", clinic.id);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
