import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSelector } from "@/components/product-selector";
import { ErrorBoundary } from "@/components/error-boundary";
import { DesignSelector } from "@/components/design-selector";
import { ProductTypeFilter } from "@/components/product-type-filter";

interface ProductsPageProps {
  searchParams: Promise<{ designId?: string; type?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      brands: {
        include: {
          designs: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const brand = user?.brands[0];
  if (!brand) {
    redirect("/dashboard/create-brand");
  }

  // Buscar design específico da query ou a mais recente
  const designIdParam = params.designId;
  
  let selectedDesign = brand.designs[0];
  
  if (designIdParam) {
    const foundDesign = brand.designs.find(d => d.id === designIdParam);
    if (foundDesign) {
      selectedDesign = foundDesign;
    }
  }
  
  // Não redirecionar se não houver estampa - mostrar mensagem na página
  const latestDesign = selectedDesign;

  // Verificar se existem produtos, se não, criar os básicos
  const allProducts = await prisma.product.findMany();
  
  // Verificar se existem produtos de cada tipo
  const hasOversized = allProducts.some(p => p.type === "camiseta-oversized");
  const hasRegata = allProducts.some(p => p.type === "regata");
  const hasCamiseta = allProducts.some(p => p.type === "camiseta");
  
  if (allProducts.length === 0 || !hasOversized || !hasRegata || !hasCamiseta) {
    // Criar produtos que faltam
    const productsToCreate = [];
    
    if (!hasCamiseta) {
      productsToCreate.push({
        name: "Camiseta Básica",
        type: "camiseta",
        basePrice: 49.90,
        colors: JSON.stringify(["Branco", "Preto", "Cinza", "Azul", "Vermelho"]),
        sizes: JSON.stringify(["P", "M", "G", "GG"]),
        fabrics: JSON.stringify(["Algodão 100%", "Algodão com elastano"]),
        isActive: true,
      });
      productsToCreate.push({
        name: "Camiseta Premium",
        type: "camiseta",
        basePrice: 79.90,
        colors: JSON.stringify(["Branco", "Preto", "Bege", "Verde"]),
        sizes: JSON.stringify(["P", "M", "G", "GG"]),
        fabrics: JSON.stringify(["Algodão penteado", "Algodão orgânico"]),
        isActive: true,
      });
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
      try {
        await prisma.product.createMany({
          data: productsToCreate,
        });
      } catch (error) {
        // Ignorar erros de duplicação
        console.log("Alguns produtos já existem, continuando...");
      }
    }
  }

  // Filtrar produtos por tipo
  const typeFilter = params.type;
  const whereClause: any = { isActive: true };
  if (typeFilter && typeFilter !== "all") {
    whereClause.type = typeFilter;
  }

  // Buscar produtos novamente após possível criação
  let products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { type: "asc" },
  }).catch((error) => {
    console.error("Erro ao buscar produtos:", error);
    return [];
  });

  // Se não encontrou produtos com o filtro, verificar se existem no banco
  if (products.length === 0 && typeFilter && typeFilter !== "all") {
    const allProductsCheck = await prisma.product.findMany({
      where: { isActive: true },
    });
    console.log("=== DEBUG PRODUTOS ===");
    console.log("Filtro aplicado:", typeFilter);
    console.log("Produtos no banco:", allProductsCheck.map(p => `${p.name} (${p.type})`));
    console.log("Produtos encontrados com filtro:", products.length);
  }

  // Debug em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log("Filtro aplicado:", typeFilter || "all");
    console.log("Produtos encontrados:", products.length);
    products.forEach(p => {
      console.log(`- ${p.name} (tipo: ${p.type})`);
    });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Escolher produtos</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!latestDesign ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nenhuma estampa criada</CardTitle>
              <CardDescription>
                Você precisa criar uma estampa antes de escolher os produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Link href="/dashboard/create-design">
                  <Button>
                    Criar estampa com IA
                  </Button>
                </Link>
                <Link href="/dashboard/upload-design">
                  <Button variant="outline">
                    Fazer upload de estampa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">Sua estampa</h2>
              {brand.designs.length > 1 && (
                <Link href="/dashboard/designs">
                  <Button variant="outline" size="sm">
                    Ver todas as estampas
                  </Button>
                </Link>
              )}
            </div>
            {brand.designs.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Selecionar estampa:</label>
                <DesignSelector designs={brand.designs} currentDesignId={latestDesign.id} />
              </div>
            )}
            <div className="mb-4">
              <img
                src={latestDesign.imageUrl}
                alt="Estampa selecionada"
                className="w-48 h-48 object-contain border rounded-lg"
              />
            </div>
          </div>
        )}

        {latestDesign && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Escolha o tipo de peça</h3>
              <ProductTypeFilter />
            </div>

            <div className="space-y-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <ErrorBoundary key={product.id}>
                    <ProductSelector
                      product={product}
                      designId={latestDesign.id}
                    />
                  </ErrorBoundary>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Nenhum produto disponível no momento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-8">
              <Link href="/dashboard/cart">
                <Button size="lg" className="w-full md:w-auto">
                  Ver carrinho
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

