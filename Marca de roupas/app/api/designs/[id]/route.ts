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
    const { name, collectionId } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { brands: { include: { designs: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const design = await prisma.design.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!design || design.brand.userId !== user.id) {
      return NextResponse.json({ error: "Estampa não encontrada" }, { status: 404 });
    }

    const updatedDesign = await prisma.design.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(collectionId !== undefined && { collectionId: collectionId || null }),
      },
    });

    return NextResponse.json(updatedDesign);
  } catch (error) {
    console.error("Erro ao atualizar estampa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar estampa" },
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

    const design = await prisma.design.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!design || design.brand.userId !== user.id) {
      return NextResponse.json({ error: "Estampa não encontrada" }, { status: 404 });
    }

    await prisma.design.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir estampa:", error);
    return NextResponse.json(
      { error: "Erro ao excluir estampa" },
      { status: 500 }
    );
  }
}

