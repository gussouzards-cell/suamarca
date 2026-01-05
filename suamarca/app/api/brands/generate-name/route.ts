import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBrandName } from "@/lib/openai";
import { checkUserLimits, incrementLogoGeneration } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar limite de geração de logotipo
    const limits = await checkUserLimits(user.id);
    if (!limits.canGenerateLogo) {
      return NextResponse.json(
        {
          error: "Limite de gerações de logotipo atingido",
          upgradeRequired: true,
          limits,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { description } = body;

    const names = await generateBrandName(description);

    // Incrementar contador apenas se não for PRO
    if (!limits.isPro) {
      await incrementLogoGeneration(user.id);
    }

    return NextResponse.json({ names });
  } catch (error) {
    console.error("Erro ao gerar nome:", error);
    return NextResponse.json(
      { error: "Erro ao gerar nome" },
      { status: 500 }
    );
  }
}


