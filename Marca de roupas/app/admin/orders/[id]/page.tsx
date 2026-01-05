import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateOrderStatus } from "@/components/admin/update-order-status";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AdminOrderPage({ params }: PageProps) {
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

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { email: true, name: true },
      },
      brand: true,
      items: {
        include: {
          product: true,
          design: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
          <Link href="/admin">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{order.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{order.brand.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">R$ {order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">
                  {order.status.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status do pagamento</p>
                <p className="font-medium capitalize">
                  {order.paymentStatus.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciar pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Atualizar status</p>
                  <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
                </div>

                {order.trackingCode && (
                  <div>
                    <p className="text-sm text-muted-foreground">Código de rastreio</p>
                    <p className="font-mono">{order.trackingCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens do pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.design.imageUrl}
                    alt="Estampa"
                    className="w-24 h-24 object-contain border rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.color} • {item.size} • {item.fabric}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity}
                    </p>
                    <p className="font-semibold mt-2">
                      R$ {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <a
                      href={item.design.imageUrl}
                      download
                      className="text-sm text-primary hover:underline"
                    >
                      Baixar estampa
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


