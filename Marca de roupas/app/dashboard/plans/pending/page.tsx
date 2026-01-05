import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
          <CardDescription>
            Seu pagamento está sendo processado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Assim que o pagamento for confirmado, seu plano PRO será ativado automaticamente.
          </p>
          <Link href="/dashboard">
            <Button className="w-full">
              Ir para o Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/plans">
            <Button variant="outline" className="w-full">
              Ver planos
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

