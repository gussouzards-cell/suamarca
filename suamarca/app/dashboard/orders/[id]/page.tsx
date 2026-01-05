import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Package, Truck } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

const statusSteps = [
  { key: "PENDING", label: "Pendente", icon: Circle },
  { key: "IN_PRODUCTION", label: "Em produção", icon: Package },
  { key: "STAMPING", label: "Estampagem", icon: CheckCircle2 },
  { key: "QUALITY_CHECK", label: "Controle de qualidade", icon: CheckCircle2 },
  { key: "SHIPPED", label: "Enviado", icon: Truck },
  { key: "DELIVERED", label: "Entregue", icon: CheckCircle2 },
];

export default async function OrderPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true,
          design: true,
        },
      },
      brand: true,
    },
  });

  if (!order || order.userId !== user?.id) {
    redirect("/dashboard");
  }

  const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Status do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isCurrent ? "text-primary" : isCompleted ? "" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground">
                            Status atual
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.trackingCode && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Código de rastreio</p>
                  <p className="font-mono font-semibold">{order.trackingCode}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Data do pedido</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">R$ {order.totalAmount.toFixed(2)}</p>
              </div>

              {order.estimatedDays && (
                <div>
                  <p className="text-sm text-muted-foreground">Prazo estimado</p>
                  <p className="font-medium">{order.estimatedDays} dias úteis</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Status do pagamento</p>
                <p className="font-medium capitalize">
                  {order.paymentStatus.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


