"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubscribePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "PRO",
          price: 29.90,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar assinatura");
      }

      const data = await response.json();

      // Se houver link de pagamento, redirecionar
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.development) {
        // Se a assinatura foi criada diretamente (modo desenvolvimento)
        toast({
          title: "Sucesso!",
          description: "Plano PRO ativado em modo de desenvolvimento!",
        });
        router.push("/dashboard/plans");
      } else {
        // Caso inesperado
        toast({
          title: "Atenção",
          description: data.message || "Assinatura processada, mas sem URL de pagamento.",
        });
        router.push("/dashboard/plans");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar a assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/plans">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Assinar Plano PRO</CardTitle>
              </div>
              <CardDescription>
                Desbloqueie gerações ilimitadas de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Plano PRO</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerações ilimitadas de logotipo e estampa
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ 29,90</p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">O que está incluído:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Gerações ilimitadas de logotipo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Gerações ilimitadas de estampa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Upload ilimitado de estampas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Assinar agora - R$ 29,90/mês
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Você será redirecionado para o pagamento seguro
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

