import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        aiLogoGenerations: 0,
        aiDesignGenerations: 0,
      } as any, // Type assertion necessário devido ao campo password customizado
    });

    // Não retornar a senha e outros campos sensíveis
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isAdmin: user.isAdmin,
      aiGenerations: user.aiGenerations,
      aiLogoGenerations: (user as any).aiLogoGenerations || 0,
      aiDesignGenerations: (user as any).aiDesignGenerations || 0,
    };

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    console.error("Stack trace:", error.stack);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    // Mensagem de erro mais específica
    let errorMessage = "Erro ao criar usuário";
    if (error.code === "P2002") {
      errorMessage = "Este e-mail já está cadastrado";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? error.message : undefined },
      { status: 500 }
    );
  }
}
