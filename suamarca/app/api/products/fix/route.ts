import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const products = await prisma.product.findMany();

    for (const product of products) {
      // Verificar e corrigir formato dos arrays
      let colors = product.colors;
      let sizes = product.sizes;
      let fabrics = product.fabrics;

      // Se não for string JSON, converter
      if (typeof colors !== 'string') {
        colors = JSON.stringify(Array.isArray(colors) ? colors : []);
      }
      if (typeof sizes !== 'string') {
        sizes = JSON.stringify(Array.isArray(sizes) ? sizes : []);
      }
      if (typeof fabrics !== 'string') {
        fabrics = JSON.stringify(Array.isArray(fabrics) ? fabrics : []);
      }

      // Atualizar produto
      await prisma.product.update({
        where: { id: product.id },
        data: {
          colors,
          sizes,
          fabrics,
        },
      });
    }

    return NextResponse.json({ 
      message: "Produtos corrigidos com sucesso",
      count: products.length 
    });
  } catch (error) {
    console.error("Erro ao corrigir produtos:", error);
    return NextResponse.json(
      { error: "Erro ao corrigir produtos" },
      { status: 500 }
    );
  }
}

