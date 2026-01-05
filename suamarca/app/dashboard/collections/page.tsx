import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionCard } from "@/components/collection-card";
import { Plus, Folder } from "lucide-react";

export default async function CollectionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      brands: {
        include: {
          collections: {
            include: {
              _count: {
                select: { designs: true },
              },
              designs: {
                take: 4,
                orderBy: { createdAt: "desc" },
              },
            },
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

  const collections = brand.collections;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Coleções</h1>
          <Link href="/dashboard/collections/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar coleção
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {collections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Nenhuma coleção criada ainda</h2>
              <p className="text-muted-foreground mb-6">
                Organize suas estampas em coleções para facilitar a gestão
              </p>
              <Link href="/dashboard/collections/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira coleção
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {collections.length} {collections.length === 1 ? "coleção criada" : "coleções criadas"}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

