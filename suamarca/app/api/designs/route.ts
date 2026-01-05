import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { brands: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const brand = user.brands[0];
    if (!brand) {
      return NextResponse.json(
        { error: "Crie uma marca primeiro" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { imageUrl, prompt, isAIGenerated } = body;

    const design = await prisma.design.create({
      data: {
        imageUrl,
        prompt: prompt || null,
        isAIGenerated: isAIGenerated || false,
        brandId: brand.id,
      },
    });

    return NextResponse.json(design);
  } catch (error) {
    console.error("Erro ao salvar estampa:", error);
    return NextResponse.json(
      { error: "Erro ao salvar estampa" },
      { status: 500 }
    );
  }
}


