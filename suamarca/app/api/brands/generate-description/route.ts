import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBrandDescription } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, style, targetAudience } = body;

    const description = await generateBrandDescription(name, style, targetAudience);

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Erro ao gerar descrição:", error);
    return NextResponse.json(
      { error: "Erro ao gerar descrição" },
      { status: 500 }
    );
  }
}


