import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDesignImage, generateDesignPrompt } from "@/lib/openai";
import { checkUserLimits, incrementDesignGeneration } from "@/lib/subscription";

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

    // Verificar limite de gerações de estampa
    const limits = await checkUserLimits(user.id);
    if (!limits.canGenerateDesign) {
      return NextResponse.json(
        {
          error: "Limite de gerações de estampa atingido",
          upgradeRequired: true,
          limits,
        },
        { status: 403 }
      );
    }

    const brand = user.brands[0];
    if (!brand) {
      return NextResponse.json(
        { error: "Crie uma marca primeiro" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    // Otimizar prompt
    const optimizedPrompt = await generateDesignPrompt(prompt, brand.style);

    // Gerar imagem
    const imageUrl = await generateDesignImage(optimizedPrompt);

    // Incrementar contador apenas se não for PRO
    if (!limits.isPro) {
      await incrementDesignGeneration(user.id);
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Erro ao gerar estampa:", error);
    return NextResponse.json(
      { error: "Erro ao gerar estampa" },
      { status: 500 }
    );
  }
}


