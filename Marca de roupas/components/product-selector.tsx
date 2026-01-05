"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  colors: string | string[];
  sizes: string | string[];
  fabrics: string | string[];
  isActive: boolean;
}

interface ProductSelectorProps {
  product: Product;
  designId: string;
}

export function ProductSelector({ product, designId }: ProductSelectorProps) {
  const { toast } = useToast();
  
  // Parse JSON strings to arrays with error handling
  const parseJsonSafely = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
        return [];
      } catch (error) {
        console.error('Erro ao fazer parse do JSON:', error);
        return [];
      }
    }
    return [];
  };
  
  const colors = parseJsonSafely(product.colors);
  const sizes = parseJsonSafely(product.sizes);
  const fabrics = parseJsonSafely(product.fabrics);
  
  const [color, setColor] = useState(() => colors[0] || "");
  const [size, setSize] = useState(() => sizes[0] || "");
  const [fabric, setFabric] = useState(() => fabrics[0] || "");
  const [quantity, setQuantity] = useState(1);

  // Atualizar valores quando os dados do produto mudarem
  useEffect(() => {
    if (colors.length > 0 && !colors.includes(color)) {
      setColor(colors[0]);
    }
    if (sizes.length > 0 && !sizes.includes(size)) {
      setSize(sizes[0]);
    }
    if (fabrics.length > 0 && !fabrics.includes(fabric)) {
      setFabric(fabrics[0]);
    }
  }, [colors, sizes, fabrics, color, size, fabric]);

  const handleAddToCart = async () => {
    // Validações
    if (!color || !size || !fabric) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione cor, tamanho e tecido.",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1) {
      toast({
        title: "Atenção",
        description: "A quantidade deve ser pelo menos 1.",
        variant: "destructive",
      });
      return;
    }

    if (!designId) {
      toast({
        title: "Erro",
        description: "Estampa não selecionada.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Buscar dados completos do produto e design via API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          designId,
          color,
          size,
          fabric,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao adicionar ao carrinho");
      }

      const data = await response.json();
      
      if (!data.item) {
        throw new Error("Dados do item não recebidos");
      }

      // Adicionar ao localStorage
      try {
        const cartItem = addToCart(data.item);
        console.log("Item adicionado ao carrinho:", cartItem);
      } catch (cartError: any) {
        console.error("Erro ao adicionar ao localStorage:", cartError);
        throw new Error("Erro ao salvar no carrinho: " + cartError.message);
      }

      toast({
        title: "Adicionado ao carrinho",
        description: `${product.name} adicionado com sucesso!`,
      });
    } catch (error: any) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar ao carrinho.",
        variant: "destructive",
      });
    }
  };

  const totalPrice = product.basePrice * quantity;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              R$ {product.basePrice.toFixed(2)} por unidade
            </CardDescription>
            <div className="mt-2">
              <span className="text-xs px-2 py-1 bg-muted rounded-md">
                {product.type === "camiseta" && "Camiseta Básica"}
                {product.type === "camiseta-oversized" && "Oversized"}
                {product.type === "regata" && "Regata"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cor</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colors.length > 0 ? (
                  colors.map((c: string) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="sem-cor" disabled>
                    Nenhuma cor disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tamanho</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.length > 0 ? (
                  sizes.map((s: string) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="sem-tamanho" disabled>
                    Nenhum tamanho disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tecido</Label>
            <Select value={fabric} onValueChange={setFabric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fabrics.length > 0 ? (
                  fabrics.map((f: string) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="sem-tecido" disabled>
                    Nenhum tecido disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-32"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">R$ {totalPrice.toFixed(2)}</p>
          </div>
          <Button onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao carrinho
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


