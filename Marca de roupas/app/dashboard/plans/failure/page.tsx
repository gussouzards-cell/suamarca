import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function FailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <CardTitle className="text-2xl">Pagamento Não Aprovado</CardTitle>
          <CardDescription>
            Não foi possível processar seu pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Por favor, tente novamente ou entre em contato com o suporte.
          </p>
          <Link href="/dashboard/plans/subscribe">
            <Button className="w-full">
              Tentar novamente
            </Button>
          </Link>
          <Link href="/dashboard/plans">
            <Button variant="outline" className="w-full">
              Voltar para planos
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

