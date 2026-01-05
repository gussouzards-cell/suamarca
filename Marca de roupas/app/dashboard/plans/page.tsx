import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default async function PlansPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { subscription: true },
  });

  const isPro = user?.subscription?.plan === "PRO" && user?.subscription?.status === "ACTIVE";

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Planos e Assinatura</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Escolha seu plano</h2>
            <p className="text-muted-foreground">
              Desbloqueie gerações ilimitadas de IA
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Plano FREE */}
            <Card>
              <CardHeader>
                <CardTitle>Plano Gratuito</CardTitle>
                <CardDescription>Perfeito para começar</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$ 0</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1 geração de logotipo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1 geração de estampa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Upload ilimitado de estampas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Acesso a todas as funcionalidades</span>
                  </li>
                </ul>
                {!isPro && (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Plano PRO */}
            <Card className="border-primary relative">
              {isPro && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Ativo
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Plano PRO</CardTitle>
                </div>
                <CardDescription>Gerações ilimitadas</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$ 29,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Gerações ilimitadas de logotipo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Gerações ilimitadas de estampa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Upload ilimitado de estampas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Acesso a todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                </ul>
                {isPro ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Ativo
                  </Button>
                ) : (
                  <Link href="/dashboard/plans/subscribe" className="block">
                    <Button className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Assinar PRO
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

