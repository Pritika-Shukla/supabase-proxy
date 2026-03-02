
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Proxy requests should be sent to the backend server directly." },
    { status: 400 }
  );
}
