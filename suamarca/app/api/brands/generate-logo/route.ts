import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDesignImage } from "@/lib/openai";
import { checkUserLimits, incrementLogoGeneration } from "@/lib/subscription";

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

    // Verificar limite de geração de logo
    const limits = await checkUserLimits(user.id);
    if (!limits.canGenerateLogo) {
      return NextResponse.json(
        {
          error: "Limite de gerações de logo atingido",
          upgradeRequired: true,
          limits,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    // Criar prompt otimizado para logo
    const logoPrompt = `Professional logo design, ${prompt}, minimalist, vector style, transparent background, high quality, print ready, 300 DPI`;

    // Gerar imagem do logo
    const imageUrl = await generateDesignImage(logoPrompt);

    // Incrementar contador apenas se não for PRO
    if (!limits.isPro) {
      await incrementLogoGeneration(user.id);
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Erro ao gerar logo:", error);
    return NextResponse.json(
      { error: "Erro ao gerar logo" },
      { status: 500 }
    );
  }
}

