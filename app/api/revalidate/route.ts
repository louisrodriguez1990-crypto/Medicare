import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "node:crypto";

// On-demand revalidation webhook. Call after a CMS quarterly drop or after the ETL writes new
// rates: POST /api/revalidate?code=99214&state=texas with header `x-signature: <hex hmac>`
// where the body is HMAC-SHA256'd with REVALIDATE_SECRET.

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const body = await req.text();
  const provided = req.headers.get("x-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const { code, state, all } = JSON.parse(body || "{}") as {
    code?: string;
    state?: string;
    all?: boolean;
  };

  if (all) {
    revalidateTag("cpt-rates");
    return NextResponse.json({ revalidated: "all" });
  }
  if (code && state) {
    revalidatePath(`/reimbursement/${code}/${state}`);
    return NextResponse.json({ revalidated: { code, state } });
  }
  return NextResponse.json({ error: "missing code+state or all flag" }, { status: 400 });
}
