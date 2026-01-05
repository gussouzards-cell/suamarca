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

    const body = await req.json();
    const { productId, designId, color, size, fabric, quantity } = body;

    // Buscar produto e design
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    const design = await prisma.design.findUnique({
      where: { id: designId },
    });

    if (!product || !design) {
      return NextResponse.json(
        { error: "Produto ou estampa não encontrado" },
        { status: 404 }
      );
    }

    // Validar dados recebidos
    if (!color || !size || !fabric || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Dados inválidos: cor, tamanho, tecido e quantidade são obrigatórios" },
        { status: 400 }
      );
    }

    // Retornar dados do item para o cliente salvar no localStorage
    const cartItem = {
      productId: product.id,
      designId: design.id,
      productName: product.name,
      designImageUrl: design.imageUrl,
      color: String(color),
      size: String(size),
      fabric: String(fabric),
      quantity: Number(quantity),
      unitPrice: Number(product.basePrice),
    };

    return NextResponse.json({ success: true, item: cartItem });
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar ao carrinho" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // O carrinho é gerenciado no cliente via localStorage
    // Esta rota pode ser usada para validação futura
    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao buscar carrinho" },
      { status: 500 }
    );
  }
}


