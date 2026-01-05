import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function SuccessPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { subscription: true },
  });

  // Atualizar status da assinatura para ACTIVE
  if (user?.subscription && user.subscription.status === "PENDING") {
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <CardTitle className="text-2xl">Pagamento Aprovado!</CardTitle>
          <CardDescription>
            Seu plano PRO foi ativado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Agora você tem acesso a gerações ilimitadas de IA!
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Plano PRO Ativo</span>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">
              Ir para o Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/plans">
            <Button variant="outline" className="w-full">
              Ver detalhes do plano
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

