import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const allProducts = await prisma.product.findMany();
    
    const hasOversized = allProducts.some(p => p.type === "camiseta-oversized");
    const hasRegata = allProducts.some(p => p.type === "regata");
    const hasCamiseta = allProducts.some(p => p.type === "camiseta");
    
    const productsToCreate = [];
    
    if (!hasCamiseta) {
      productsToCreate.push(
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
          name: "Camiseta Premium",
          type: "camiseta",
          basePrice: 79.90,
          colors: JSON.stringify(["Branco", "Preto", "Bege", "Verde"]),
          sizes: JSON.stringify(["P", "M", "G", "GG"]),
          fabrics: JSON.stringify(["Algodão penteado", "Algodão orgânico"]),
          isActive: true,
        }
      );
    }
    
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
    
    const finalProducts = await prisma.product.findMany({
      where: { isActive: true },
    });
    
    return NextResponse.json({
      message: "Produtos verificados",
      created: productsToCreate.length,
      total: finalProducts.length,
      products: finalProducts.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isActive: p.isActive,
      })),
    });
  } catch (error: any) {
    console.error("Erro ao garantir produtos:", error);
    return NextResponse.json(
      { error: "Erro ao garantir produtos", details: error.message },
      { status: 500 }
    );
  }
}

