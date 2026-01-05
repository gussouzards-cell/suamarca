import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DesignCard } from "@/components/design-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
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
              designs: {
                include: {
                  collection: true,
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  const brand = user?.brands[0];
  if (!brand) {
    redirect("/dashboard/create-brand");
  }

  const collection = brand.collections.find((c) => c.id === id);
  if (!collection) {
    redirect("/dashboard/collections");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground">{collection.description}</p>
            )}
          </div>
          <Link href="/dashboard/collections">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            {collection.designs.length} {collection.designs.length === 1 ? "estampa" : "estampas"} nesta coleção
          </p>
        </div>

        {collection.designs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Esta coleção ainda não tem estampas.
              </p>
              <Link href="/dashboard/designs">
                <Button>Ver minhas estampas</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                collections={brand.collections}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

