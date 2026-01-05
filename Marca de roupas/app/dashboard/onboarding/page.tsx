"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight, CheckCircle2, Shirt, Image, ShoppingBag, CreditCard, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Criar estampas",
    description: "Gere estampas com IA ou faça upload das suas próprias artes",
    icon: Image,
  },
  {
    id: 2,
    title: "Visualizar em produtos",
    description: "Veja suas estampas aplicadas em camisetas realistas",
    icon: Shirt,
  },
  {
    id: 3,
    title: "Escolher produtos",
    description: "Selecione cores, tamanhos e quantidades",
    icon: ShoppingBag,
  },
  {
    id: 4,
    title: "Finalizar compra",
    description: "Complete seu pedido com pagamento seguro",
    icon: CreditCard,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState("");
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalSteps = 2;
  const progress = Math.round((currentStep / totalSteps) * 100);

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) {
      toast({
        title: "Atenção",
        description: "Descreva como você quer seu logo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/brands/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: logoPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.upgradeRequired) {
          toast({
            title: "Limite atingido",
            description: "Você atingiu o limite de gerações gratuitas.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Erro ao gerar logo");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedLogos((prev) => [...prev, data.imageUrl]);
        toast({
          title: "Logo gerado!",
          description: "Selecione o logo que mais gostou.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o logo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedLogo) {
      toast({
        title: "Atenção",
        description: "Selecione um logo primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/brands/update-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: selectedLogo }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso!",
        description: "Logo salvo com sucesso!",
      });

      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o logo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep(2);
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {currentStep === 1 ? "Criar logo" : "Guia rápido"}
              </span>
              {currentStep === 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Pular esta etapa
                </Button>
              )}
            </div>
            {mounted ? (
              <Progress value={progress} className="h-2" max={100} />
            ) : (
              <div className="h-2 w-full rounded-full bg-primary/20" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {currentStep === 1 ? "Crie o logo da sua marca" : "Bem-vindo à Sua Marca!"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "Gere um logo único para sua marca usando IA"
              : "Aprenda como usar a plataforma em poucos passos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logoPrompt">Descreva como você quer seu logo</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="logoPrompt"
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    placeholder="Ex: Logo minimalista com o nome da marca em fonte moderna, cores preto e branco"
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateLogo}
                    disabled={isGenerating || !logoPrompt.trim()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? "Gerando..." : "Gerar"}
                  </Button>
                </div>
              </div>

              {generatedLogos.length > 0 && (
                <div className="space-y-4">
                  <Label>Logos gerados - Selecione o que mais gostou:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {generatedLogos.map((logoUrl, index) => (
                      <div
                        key={index}
                        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedLogo === logoUrl
                            ? "border-primary ring-2 ring-primary"
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedLogo(logoUrl)}
                      >
                        <img
                          src={logoUrl}
                          alt={`Logo ${index + 1}`}
                          className="w-full h-48 object-contain bg-muted"
                        />
                        {selectedLogo === logoUrl && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedLogos((prev) => prev.filter((_, i) => i !== index));
                            if (selectedLogo === logoUrl) {
                              setSelectedLogo(null);
                            }
                          }}
                          className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Pular
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveLogo}
                  disabled={isLoading || !selectedLogo}
                  className="flex-1"
                >
                  {isLoading ? "Salvando..." : "Salvar logo"}
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Card key={step.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{step.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Próximos passos:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Acesse "Criar estampa com IA" para gerar sua primeira estampa</li>
                  <li>Ou faça upload de uma estampa própria em "Fazer upload de estampa"</li>
                  <li>Visualize a estampa aplicada em diferentes produtos</li>
                  <li>Escolha cores, tamanhos e quantidades</li>
                  <li>Finalize sua compra e receba em casa!</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Link href="/dashboard/create-design" className="flex-1">
                  <Button className="w-full">
                    Criar minha primeira estampa
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleFinish}
                  className="flex-1"
                >
                  Ir para o dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

