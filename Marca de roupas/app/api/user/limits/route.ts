import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserLimits } from "@/lib/subscription";

export async function GET() {
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

    const limits = await checkUserLimits(user.id);
    return NextResponse.json(limits);
  } catch (error) {
    console.error("Erro ao buscar limites:", error);
    return NextResponse.json(
      { error: "Erro ao buscar limites" },
      { status: 500 }
    );
  }
}

