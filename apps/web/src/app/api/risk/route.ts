import { NextRequest, NextResponse } from "next/server";
import { ruleBasedRisk, type CheckInInput } from "@matriwatch/shared";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as CheckInInput;
  const mlUrl = process.env.NEXT_PUBLIC_MATRIWATCH_ML_URL;

  if (mlUrl) {
    try {
      const response = await fetch(`${mlUrl}/score/checkin`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {
      // Fall through to the local rule engine for offline development.
    }
  }

  return NextResponse.json({ ...ruleBasedRisk(payload), model: "shared-rule-engine-v1" });
}
