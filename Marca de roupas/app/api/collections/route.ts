import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        brands: {
          include: {
            collections: {
              include: {
                _count: {
                  select: { designs: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    const brand = user?.brands[0];
    if (!brand) {
      return NextResponse.json({ collections: [] });
    }

    return NextResponse.json({ collections: brand.collections });
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    return NextResponse.json(
      { error: "Erro ao buscar coleções" },
      { status: 500 }
    );
  }
}

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
    const { name, description } = body;

    const collection = await prisma.collection.create({
      data: {
        name,
        description: description || null,
        brandId: brand.id,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Erro ao criar coleção:", error);
    return NextResponse.json(
      { error: "Erro ao criar coleção" },
      { status: 500 }
    );
  }
}

