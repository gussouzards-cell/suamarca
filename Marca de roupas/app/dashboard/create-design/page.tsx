"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MockupCanvas } from "@/components/mockup-canvas";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { UpgradeBanner } from "@/components/upgrade-banner";

interface UserLimits {
  canGenerateDesign: boolean;
  logoGenerationsUsed: number;
  designGenerationsUsed: number;
  plan: string;
}

export default function CreateDesignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [suggestions] = useState([
    "Estampa minimalista com linhas geométricas",
    "Design tipográfico com frase inspiradora",
    "Ilustração artística abstrata",
    "Logo estilizado para streetwear",
    "Padrão repetitivo moderno",
  ]);

  useEffect(() => {
    fetch("/api/user/limits")
      .then((res) => res.json())
      .then((data) => setLimits(data))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Atenção",
        description: "Digite uma descrição para a estampa.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/designs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.upgradeRequired) {
          setLimits(errorData.limits);
          toast({
            title: "Limite atingido",
            description: "Você atingiu o limite de gerações gratuitas. Faça upgrade para PRO!",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Erro ao gerar estampa");
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      
      // Atualizar limites após geração
      const limitsResponse = await fetch("/api/user/limits");
      if (limitsResponse.ok) {
        const updatedLimits = await limitsResponse.json();
        setLimits(updatedLimits);
      }
      
      toast({
        title: "Sucesso",
        description: "Estampa gerada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a estampa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
  };

  const handleUseDesign = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: generatedImage,
          prompt,
          isAIGenerated: true,
        }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Estampa salva! Agora você pode escolher os produtos.",
      });

      router.push("/dashboard/designs");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a estampa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Criar estampa com IA</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {limits && !limits.canGenerateDesign && (
          <div className="mb-6">
            <UpgradeBanner type="design" limits={limits} />
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Descreva sua estampa</CardTitle>
              <CardDescription>
                Use palavras-chave para descrever o que você quer na estampa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Descrição</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Estampa minimalista com gato estilizado em preto e branco"
                  rows={4}
                />
              </div>

              <div>
                <Label className="mb-2 block">Sugestões</Label>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setPrompt(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Gerando estampa..." : "Gerar estampa"}
              </Button>

              {generatedImage && (
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {generatedImage ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Preview da estampa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <img
                        src={generatedImage}
                        alt="Estampa gerada"
                        className="w-full rounded-lg border"
                      />
                    </div>
                    <MockupCanvas designUrl={generatedImage} />
                  </CardContent>
                </Card>
                <Button
                  onClick={handleUseDesign}
                  className="w-full"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Usar esta estampa
                </Button>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gere uma estampa para ver o preview aqui</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


