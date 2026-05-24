import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = process.env.N8N_SUBMIT_APP;
  if (!url) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.json();

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      throw new Error(`Upstream ${upstream.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[submit]", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 502 });
  }
}