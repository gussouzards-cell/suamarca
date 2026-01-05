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
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const { name, style, targetAudience, description, slogan, positioning } = body;

    const brand = await prisma.brand.create({
      data: {
        name,
        style,
        targetAudience,
        description: description || null,
        slogan: slogan || null,
        positioning: positioning || null,
        userId: user.id,
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Erro ao criar marca:", error);
    return NextResponse.json(
      { error: "Erro ao criar marca" },
      { status: 500 }
    );
  }
}


