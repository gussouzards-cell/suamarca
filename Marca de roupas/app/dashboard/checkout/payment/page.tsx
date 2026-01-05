"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      // Buscar dados do pagamento
      fetch(`/api/payments/${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          setPaymentData(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [paymentId]);

  const handleCopyQrCode = () => {
    if (paymentData?.qrCode) {
      navigator.clipboard.writeText(paymentData.qrCode);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
          <CardTitle>Pagamento PIX</CardTitle>
          <CardDescription>
            Escaneie o QR Code ou copie o código para pagar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentData?.qrCodeBase64 && (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                alt="QR Code PIX"
                className="border rounded-lg"
              />
            </div>
          )}

          {paymentData?.qrCode && (
            <div className="space-y-2">
              <Label>Código PIX</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentData.qrCode}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyQrCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Após o pagamento, seu pedido será processado automaticamente.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Voltar ao dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}

