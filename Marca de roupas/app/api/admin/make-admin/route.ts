import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota para tornar um usuário admin
// ATENÇÃO: Em produção, proteja esta rota ou remova após configurar o primeiro admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    return NextResponse.json({
      message: "Usuário promovido a admin com sucesso",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error: any) {
    console.error("Erro ao tornar usuário admin:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao tornar usuário admin" },
      { status: 500 }
    );
  }
}

