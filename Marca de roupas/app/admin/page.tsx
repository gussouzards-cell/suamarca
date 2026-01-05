import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpdateOrderStatus } from "@/components/admin/update-order-status";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.isAdmin) {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true, name: true },
      },
      brand: {
        select: { name: true },
      },
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
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Pedidos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos da plataforma
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      {order.brand.name} • {order.user.email}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Itens:</p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 text-sm">
                          <img
                            src={item.design.imageUrl}
                            alt="Estampa"
                            className="w-16 h-16 object-contain border rounded"
                          />
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-muted-foreground">
                              {item.color} • {item.size} • Qtd: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline">Ver detalhes</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


