import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Verificar se já existem produtos
    const existingProducts = await prisma.product.findMany();
    if (existingProducts.length > 0) {
      return NextResponse.json({ message: "Produtos já existem" });
    }

    // Criar produtos iniciais
    const products = await prisma.product.createMany({
      data: [
        {
          name: "Camiseta Básica",
          type: "camiseta",
          basePrice: 49.90,
          colors: JSON.stringify(["Branco", "Preto", "Cinza", "Azul", "Vermelho"]),
          sizes: JSON.stringify(["P", "M", "G", "GG"]),
          fabrics: JSON.stringify(["Algodão 100%", "Algodão com elastano"]),
          isActive: true,
        },
        {
          name: "Camiseta Oversized",
          type: "camiseta-oversized",
          basePrice: 59.90,
          colors: JSON.stringify(["Branco", "Preto", "Cinza", "Bege", "Verde"]),
          sizes: JSON.stringify(["M", "G", "GG", "XG"]),
          fabrics: JSON.stringify(["Algodão 100%", "Algodão com elastano"]),
          isActive: true,
        },
        {
          name: "Camiseta Regata",
          type: "regata",
          basePrice: 39.90,
          colors: JSON.stringify(["Branco", "Preto", "Cinza", "Azul", "Vermelho"]),
          sizes: JSON.stringify(["P", "M", "G", "GG"]),
          fabrics: JSON.stringify(["Algodão 100%", "Algodão com elastano"]),
          isActive: true,
        },
        {
          name: "Camiseta Premium",
          type: "camiseta",
          basePrice: 79.90,
          colors: JSON.stringify(["Branco", "Preto", "Bege", "Verde"]),
          sizes: JSON.stringify(["P", "M", "G", "GG"]),
          fabrics: JSON.stringify(["Algodão penteado", "Algodão orgânico"]),
          isActive: true,
        },
      ],
    });

    return NextResponse.json({ message: "Produtos criados com sucesso", products });
  } catch (error) {
    console.error("Erro ao criar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao criar produtos" },
      { status: 500 }
    );
  }
}


