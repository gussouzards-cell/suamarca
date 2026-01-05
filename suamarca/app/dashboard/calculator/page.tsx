"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, DollarSign, Package, Lightbulb, Target, Users, ShoppingCart, BarChart3 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  type: string;
  basePrice: number;
}

interface CalculationResult {
  costPerUnit: number;
  sellingPrice: number;
  profitPerUnit: number;
  totalProfit: number;
  margin: number;
}

export default function CalculatorPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [margin, setMargin] = useState<number>(50);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct && quantity > 0 && margin >= 0) {
      calculateProfit();
    }
  }, [selectedProduct, quantity, margin]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfit = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const costPerUnit = product.basePrice;
    const marginDecimal = margin / 100;
    const sellingPrice = costPerUnit * (1 + marginDecimal);
    const profitPerUnit = sellingPrice - costPerUnit;
    const totalProfit = profitPerUnit * quantity;
    const actualMargin = (profitPerUnit / sellingPrice) * 100;

    setCalculation({
      costPerUnit,
      sellingPrice: Number(sellingPrice.toFixed(2)),
      profitPerUnit: Number(profitPerUnit.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      margin: Number(actualMargin.toFixed(2)),
    });
  };

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Calculadora de Lucro
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculadora */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calcule seu lucro</CardTitle>
                <CardDescription>
                  Escolha o produto, quantidade e margem de lucro desejada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.basePrice.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin">Margem de Lucro (%)</Label>
                    <Input
                      id="margin"
                      type="number"
                      min="0"
                      max="500"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {calculation && selectedProductData && (
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Custo Unitário
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          R$ {calculation.costPerUnit.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Preço de Venda
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          R$ {calculation.sellingPrice.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Lucro por Unidade
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {calculation.profitPerUnit.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Lucro Total ({quantity} unidades)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {calculation.totalProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Margem real: {calculation.margin}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guia de Boas Práticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Guia de Boas Práticas
                </CardTitle>
                <CardDescription>
                  Dicas essenciais para maximizar seus lucros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Defina uma margem adequada</h4>
                      <p className="text-sm text-muted-foreground">
                        Margens entre 50% e 100% são comuns no mercado de roupas. Considere seus custos
                        operacionais (marketing, embalagem, frete) ao definir o preço final.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Analise a concorrência</h4>
                      <p className="text-sm text-muted-foreground">
                        Pesquise preços de produtos similares no mercado. Seu preço deve ser competitivo,
                        mas não necessariamente o mais barato. Foque no valor agregado.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Compre em quantidade</h4>
                      <p className="text-sm text-muted-foreground">
                        Pedidos maiores geralmente têm melhor custo-benefício. Planeje suas compras
                        para reduzir custos unitários e aumentar sua margem de lucro.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Monitore seus resultados</h4>
                      <p className="text-sm text-muted-foreground">
                        Acompanhe quais produtos vendem mais e ajuste seus preços conforme necessário.
                        Produtos com alta demanda podem ter margens maiores.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dicas de Vendas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Dicas de Vendas
                </CardTitle>
                <CardDescription>
                  Estratégias para aumentar suas vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Conheça seu público</h4>
                      <p className="text-sm text-muted-foreground">
                        Entenda quem são seus clientes, o que eles valorizam e quanto estão dispostos
                        a pagar. Isso ajuda a definir preços e estratégias de marketing.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Crie ofertas estratégicas</h4>
                      <p className="text-sm text-muted-foreground">
                        Promoções como "Compre 2 e ganhe 10% de desconto" podem aumentar o ticket médio
                        e ainda manter uma margem saudável.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Valorize sua marca</h4>
                      <p className="text-sm text-muted-foreground">
                        Não venda apenas o produto, venda a experiência. Uma marca forte permite
                        preços mais altos e clientes mais fiéis.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Use redes sociais</h4>
                      <p className="text-sm text-muted-foreground">
                        Instagram, TikTok e outras plataformas são essenciais para divulgar seus produtos.
                        Conteúdo autêntico e visual atraente aumentam as vendas.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Invista em embalagem</h4>
                      <p className="text-sm text-muted-foreground">
                        Uma embalagem bonita e personalizada cria uma experiência premium e justifica
                        preços mais altos. O cliente se sente valorizado.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com informações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Margens Recomendadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Iniciante</p>
                  <p className="text-xs text-muted-foreground">30-50%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para começar e ganhar experiência
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Intermediário</p>
                  <p className="text-xs text-muted-foreground">50-80%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para quem já tem clientes fiéis
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Avançado</p>
                  <p className="text-xs text-muted-foreground">80-150%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para marcas estabelecidas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fórmula de Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Preço de Venda:</p>
                  <p className="text-muted-foreground">
                    Custo × (1 + Margem%)
                  </p>
                </div>
                <div>
                  <p className="font-medium">Lucro por Unidade:</p>
                  <p className="text-muted-foreground">
                    Preço de Venda - Custo
                  </p>
                </div>
                <div>
                  <p className="font-medium">Lucro Total:</p>
                  <p className="text-muted-foreground">
                    Lucro por Unidade × Quantidade
                  </p>
                </div>
              </CardContent>
            </Card>

            {calculation && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investimento:</span>
                    <span className="font-medium">
                      R$ {(calculation.costPerUnit * quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Receita Total:</span>
                    <span className="font-medium">
                      R$ {(calculation.sellingPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Lucro Líquido:</span>
                    <span className="font-bold text-green-600">
                      R$ {calculation.totalProfit.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

