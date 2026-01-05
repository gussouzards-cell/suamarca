"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingData {
  // Etapa 1: Conta
  name: string;
  email: string;
  password: string;
  
  // Etapa 2: Marca
  brandName: string;
  brandStyle: string;
  brandTargetAudience: string;
  brandDescription: string;
  brandSlogan: string;
  brandPositioning: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    email: "",
    password: "",
    brandName: "",
    brandStyle: "",
    brandTargetAudience: "",
    brandDescription: "",
    brandSlogan: "",
    brandPositioning: "",
  });

  const totalSteps = 2;
  const progress = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerateBrandName = async () => {
    if (!formData.brandDescription) {
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
        body: JSON.stringify({ description: formData.brandDescription }),
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
        throw new Error(errorData.error || "Erro ao gerar nome");
      }

      const data = await response.json();
      if (data.names) {
        const names = data.names.split("\n").filter((n: string) => n.trim());
        setFormData((prev) => ({ ...prev, brandName: names[0]?.replace(/^\d+\.\s*/, "") || prev.brandName }));
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o nome.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.brandName || !formData.brandStyle || !formData.brandTargetAudience) {
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
          name: formData.brandName,
          style: formData.brandStyle,
          targetAudience: formData.brandTargetAudience,
        }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      if (data.description) {
        setFormData((prev) => ({ ...prev, brandDescription: data.description }));
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a descrição.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Atenção",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Atenção",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Erro na resposta:", response.status, data);
        throw new Error(data.error || `Erro ao criar conta (${response.status})`);
      }

      console.log("Usuário criado com sucesso:", data);

      // Aguardar um pouco para garantir que o usuário foi salvo no banco
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Fazer login automático após cadastro
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log("Resultado do login:", result);

      if (result?.ok) {
        setCurrentStep(2);
        toast({
          title: "Conta criada!",
          description: "Agora vamos criar sua marca.",
        });
      } else {
        console.error("Erro no login:", result?.error);
        // Mesmo com erro no login, permitir continuar se a conta foi criada
        if (data.user) {
          toast({
            title: "Conta criada!",
            description: "Faça login manualmente para continuar.",
          });
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          throw new Error(result?.error || "Erro ao fazer login");
        }
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a conta. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brandName || !formData.brandStyle || !formData.brandTargetAudience) {
      toast({
        title: "Atenção",
        description: "Preencha nome, estilo e público-alvo da marca.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.brandName,
          style: formData.brandStyle,
          targetAudience: formData.brandTargetAudience,
          description: formData.brandDescription,
          slogan: formData.brandSlogan,
          positioning: formData.brandPositioning,
        }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso!",
        description: "Sua marca foi criada com sucesso!",
      });

      router.push("/dashboard/onboarding");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a marca.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Etapa {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {currentStep === 1 ? "Criar conta" : "Criar sua marca"}
              </span>
            </div>
            {mounted ? (
              <Progress value={progress} className="h-2" max={100} />
            ) : (
              <div className="h-2 w-full rounded-full bg-primary/20" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {currentStep === 1 ? "Criar sua conta" : "Criar sua marca"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "Comece criando sua conta na plataforma"
              : "Configure os detalhes da sua marca de roupas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Continuar"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="brandName">Nome da marca</Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brandName: e.target.value }))}
                      placeholder="Ex: Minha Marca"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateBrandName}
                    disabled={isGenerating || !formData.brandDescription}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? "Gerando..." : "IA"}
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandStyle">Estilo da marca</Label>
                  <Select
                    value={formData.brandStyle}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, brandStyle: value }))}
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
                  <Label htmlFor="brandTargetAudience">Público-alvo</Label>
                  <Select
                    value={formData.brandTargetAudience}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, brandTargetAudience: value }))}
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
                <Label htmlFor="brandSlogan">Slogan</Label>
                <Input
                  id="brandSlogan"
                  value={formData.brandSlogan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brandSlogan: e.target.value }))}
                  placeholder="Ex: Estilo que define você"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandPositioning">Posicionamento</Label>
                <Textarea
                  id="brandPositioning"
                  value={formData.brandPositioning}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brandPositioning: e.target.value }))}
                  placeholder="Como sua marca se posiciona no mercado?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="brandDescription">Descrição da marca</Label>
                    <Textarea
                      id="brandDescription"
                      value={formData.brandDescription}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brandDescription: e.target.value }))}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Criando marca..." : "Finalizar"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

