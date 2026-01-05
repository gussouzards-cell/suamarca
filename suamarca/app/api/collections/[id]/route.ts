import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { brands: { include: { collections: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!collection || collection.brand.userId !== user.id) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error("Erro ao atualizar coleção:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar coleção" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!collection || collection.brand.userId !== user.id) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir coleção:", error);
    return NextResponse.json(
      { error: "Erro ao excluir coleção" },
      { status: 500 }
    );
  }
}

