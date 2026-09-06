import { NextRequest, NextResponse } from "next/server";
import { fetchPonsTokens } from "@/lib/pons-data";
import { sendTelegramAlert } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { tokens } = await fetchPonsTokens();

    const alerts: string[] = [];

    for (const token of tokens) {
      if (token.heat && token.heat >= 200 && token.ageSec && token.ageSec < 3600) {
        const sent = await sendTelegramAlert(
          token.token,
          token.heat,
          token.name,
          token.symbol
        );
        if (sent) {
          alerts.push(token.token);
        }
      }
    }

    return NextResponse.json({
      success: true,
      alerted: alerts.length,
      tokens: alerts,
    });
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json({ error: "Notify failed" }, { status: 500 });
  }
}
