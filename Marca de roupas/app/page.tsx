import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Shirt, Package, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sua Marca</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/signup/onboarding">
              <Button>Criar minha marca</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Crie sua própria marca de roupas em minutos
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sem estoque, sem fornecedor e sem complicação. Use inteligência artificial 
          para criar estampas únicas e receba seus produtos em casa.
        </p>
        <Link href="/signup/onboarding">
          <Button size="lg" className="text-lg px-8 py-6">
            Criar minha marca
          </Button>
        </Link>
      </section>

      {/* Como funciona */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Como funciona</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Sparkles className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Criar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie sua marca e gere estampas com IA ou suba suas próprias artes
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Shirt className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Estampar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize suas estampas aplicadas em camisetas realistas
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Package className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Produzir</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Escolha peças, quantidades e finalize sua compra
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receba seus produtos em casa, prontos para vender ou usar
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Para quem é */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-lg">
        <h3 className="text-3xl font-bold text-center mb-12">Para quem é</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Criadores de conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie produtos exclusivos para sua audiência sem se preocupar com estoque
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Empreendedores iniciantes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comece seu negócio de moda sem investimento inicial em estoque
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pequenas marcas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Teste novos designs e expanda sua linha de produtos com facilidade
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Eventos e comunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie produtos personalizados para eventos, grupos e comunidades
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Prova social */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">O que nossos usuários dizem</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                &quot;Consegui criar minha marca em menos de 30 minutos. A IA me ajudou 
                a criar estampas incríveis!&quot;
              </p>
              <p className="text-sm font-semibold">— Maria Silva</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                &quot;Perfeito para testar novos designs sem investir em estoque. 
                Recomendo muito!&quot;
              </p>
              <p className="text-sm font-semibold">— João Santos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                &quot;A interface é super intuitiva. Mesmo sem conhecimento técnico, 
                consegui criar tudo sozinha.&quot;
              </p>
              <p className="text-sm font-semibold">— Ana Costa</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 Sua Marca. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}


