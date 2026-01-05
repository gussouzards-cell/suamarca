import { NextResponse } from "next/server";

export async function GET() {
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return NextResponse.json({
    googleEnabled: hasGoogle,
    message: hasGoogle
      ? "Google OAuth está configurado"
      : "Google OAuth não está configurado. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env",
  });
}

