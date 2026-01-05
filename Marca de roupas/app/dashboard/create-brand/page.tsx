"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { UpgradeBanner } from "@/components/upgrade-banner";

interface UserLimits {
  canGenerateLogo: boolean;
  logoGenerationsUsed: number;
  designGenerationsUsed: number;
  plan: string;
}

export default function CreateBrandPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    style: "",
    targetAudience: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/user/limits")
      .then((res) => res.json())
      .then((data) => setLimits(data))
      .catch(() => {});
  }, []);

  const handleGenerateName = async () => {
    if (!formData.description) {
      toast({
        title: "Atenção",
        description: "Descreva sua marca primeiro para gerar um nome.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/brands/generate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: formData.description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.upgradeRequired) {
          setLimits(errorData.limits);
          toast({
            title: "Limite atingido",
            description: "Você atingiu o limite de gerações de logotipo. Faça upgrade para PRO!",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Erro ao gerar nome");
      }

      const data = await response.json();
      if (data.names) {
        const names = data.names.split("\n").filter((n: string) => n.trim());
        setFormData((prev) => ({ ...prev, name: names[0]?.replace(/^\d+\.\s*/, "") || prev.name }));
      }

      // Atualizar limites após geração
      const limitsResponse = await fetch("/api/user/limits");
      if (limitsResponse.ok) {
        const updatedLimits = await limitsResponse.json();
        setLimits(updatedLimits);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o nome. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.style || !formData.targetAudience) {
      toast({
        title: "Atenção",
        description: "Preencha nome, estilo e público-alvo primeiro.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/brands/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          style: formData.style,
          targetAudience: formData.targetAudience,
        }),
      });

      const data = await response.json();
      if (data.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a descrição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Marca criada com sucesso!",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a marca. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        {limits && !limits.canGenerateLogo && (
          <UpgradeBanner type="logo" limits={limits} />
        )}
        <Card className="w-full">
        <CardHeader>
          <CardTitle>Criar sua marca</CardTitle>
          <CardDescription>
            Configure os detalhes da sua marca de roupas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="name">Nome da marca</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Minha Marca"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateName}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? "Gerando..." : "Gerar com IA"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Estilo da marca</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, style: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streetwear">Streetwear</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="tipografico">Tipográfico</SelectItem>
                    <SelectItem value="artistico">Artístico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Público-alvo</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, targetAudience: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jovens">Jovens</SelectItem>
                    <SelectItem value="adultos">Adultos</SelectItem>
                    <SelectItem value="criadores">Criadores de conteúdo</SelectItem>
                    <SelectItem value="empresas">Empresas</SelectItem>
                    <SelectItem value="eventos">Eventos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva sua marca..."
                    rows={4}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? "Gerando..." : "IA"}
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar marca"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


