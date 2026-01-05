import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Buscar todos os produtos
    const existingProducts = await prisma.product.findMany();
    
    // Verificar se existem produtos de cada tipo
    const hasCamiseta = existingProducts.some(p => p.type === "camiseta");
    const hasOversized = existingProducts.some(p => p.type === "camiseta-oversized");
    const hasRegata = existingProducts.some(p => p.type === "regata");

    const productsToCreate = [];

    if (!hasOversized) {
      productsToCreate.push({
        name: "Camiseta Oversized",
        type: "camiseta-oversized",
        basePrice: 59.90,
        colors: JSON.stringify(["Branco", "Preto", "Cinza", "Bege", "Verde"]),
        sizes: JSON.stringify(["M", "G", "GG", "XG"]),
        fabrics: JSON.stringify(["Algodão 100%", "Algodão com elastano"]),
        isActive: true,
      });
    }

    if (!hasRegata) {
      productsToCreate.push({
        name: "Camiseta Regata",
        type: "regata",
        basePrice: 39.90,
        colors: JSON.stringify(["Branco", "Preto", "Cinza", "Azul", "Vermelho"]),
        sizes: JSON.stringify(["P", "M", "G", "GG"]),
        fabrics: JSON.stringify(["Algodão 100%", "Algodão com elastano"]),
        isActive: true,
      });
    }

    if (productsToCreate.length > 0) {
      await prisma.product.createMany({
        data: productsToCreate,
      });
    }

    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({
      message: "Produtos verificados",
      existing: existingProducts.length,
      created: productsToCreate.length,
      products: allProducts.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isActive: p.isActive,
      })),
    });
  } catch (error) {
    console.error("Erro ao verificar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao verificar produtos", details: String(error) },
      { status: 500 }
    );
  }
}

