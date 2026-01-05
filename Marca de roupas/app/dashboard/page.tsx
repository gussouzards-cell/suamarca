import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Upload, ShoppingBag, Package, Image as ImageIcon, Crown, Calculator, Shield } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      brands: {
        include: {
          _count: {
            select: { designs: true, orders: true },
          },
        },
      },
    },
  });

  const brand = user?.brands[0];

  if (!brand) {
    redirect("/dashboard/create-brand");
  }

  const recentDesigns = await prisma.design.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const recentOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: {
        include: {
          product: true,
          design: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Sua Marca
          </Link>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Link href="/api/auth/signout">
              <Button variant="ghost" size="sm">Sair</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{brand.name}</h1>
          <p className="text-muted-foreground">{brand.description || "Sua marca de roupas"}</p>
        </div>

        {user?.subscription?.plan !== "PRO" && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Upgrade para PRO</h3>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie gerações ilimitadas de logotipo e estampa
                  </p>
                </div>
                <Link href="/dashboard/plans">
                  <Button>
                    <Crown className="h-4 w-4 mr-2" />
                    Ver planos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/create-design">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Sparkles className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Criar estampa com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use inteligência artificial para gerar estampas únicas
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/upload-design">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Subir minha estampa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Faça upload da sua própria arte ou design
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/designs">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <ImageIcon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Minhas estampas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Veja todas as suas estampas criadas
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/products">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingBag className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Escolher peças</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Veja os produtos disponíveis e faça seu pedido
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/calculator">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/50 bg-primary/5">
              <CardHeader>
                <Calculator className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Calculadora de Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Calcule margens de lucro e descubra quanto pode ganhar com suas vendas
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {recentDesigns.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Estampas recentes</h2>
              <Link href="/dashboard/designs">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentDesigns.map((design) => (
                <Link
                  key={design.id}
                  href={`/dashboard/products?designId=${design.id}`}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center p-2">
                      <img
                        src={design.imageUrl}
                        alt={design.name || "Estampa"}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground truncate">
                        {design.name || "Sem nome"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {user?.subscription?.plan !== "PRO" && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Upgrade para PRO</h3>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie gerações ilimitadas de logotipo e estampa
                  </p>
                </div>
                <Link href="/dashboard/plans">
                  <Button>
                    <Crown className="h-4 w-4 mr-2" />
                    Ver planos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estampas criadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{brand._count.designs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{brand._count.orders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    {user?.subscription?.plan === "PRO" && user?.subscription?.status === "ACTIVE" ? "PRO" : "FREE"}
                  </p>
                  {user?.subscription?.plan === "PRO" && user?.subscription?.status === "ACTIVE" ? (
                    <p className="text-xs text-muted-foreground">Gerações ilimitadas</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {user?.aiLogoGenerations || 0}/1 logotipo • {user?.aiDesignGenerations || 0}/1 estampa
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {recentOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pedidos recentes</h2>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.status.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="outline" size="sm">Ver detalhes</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


