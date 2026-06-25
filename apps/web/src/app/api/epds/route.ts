import { NextRequest, NextResponse } from "next/server";
import { scoreEpds, type EpdsAnswer } from "@matriwatch/shared";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { responses: EpdsAnswer[]; age?: number; deliveryHistory?: string };
  const mlUrl = process.env.NEXT_PUBLIC_MATRIWATCH_ML_URL;

  if (mlUrl) {
    try {
      const response = await fetch(`${mlUrl}/score/epds`, {
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
      // Fall through to the local EPDS threshold scorer for offline development.
    }
  }

  return NextResponse.json({ ...scoreEpds(payload.responses), model: "shared-epds-threshold-v1" });
}
