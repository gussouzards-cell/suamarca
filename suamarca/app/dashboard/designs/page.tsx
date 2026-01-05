import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { DesignCard } from "@/components/design-card";

export default async function DesignsPage() {
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
            include: {
              collection: true,
            },
            orderBy: { createdAt: "desc" },
          },
          collections: {
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

  const designs = brand.designs;
  const collections = brand.collections;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Minhas Estampas</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/collections">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Coleções
              </Button>
            </Link>
            <Link href="/dashboard/create-design">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Criar com IA
              </Button>
            </Link>
            <Link href="/dashboard/upload-design">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Fazer upload
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {designs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Nenhuma estampa criada ainda</h2>
              <p className="text-muted-foreground mb-6">
                Comece criando sua primeira estampa com IA ou fazendo upload da sua arte
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard/create-design">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Criar com IA
                  </Button>
                </Link>
                <Link href="/dashboard/upload-design">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer upload
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                {designs.length} {designs.length === 1 ? "estampa criada" : "estampas criadas"}
              </p>
              {collections.length > 0 && (
                <div className="flex gap-2">
                  <Link href="/dashboard/collections">
                    <Button variant="outline" size="sm">
                      Ver coleções ({collections.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  collections={collections}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
