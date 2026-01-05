"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Trash2 } from "lucide-react";
import { getCart, removeFromCart, type CartItem } from "@/lib/cart";


export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = () => {
    const cartItems = getCart();
    setItems(cartItems);
    setIsLoading(false);
  };

  useEffect(() => {
    // Buscar carrinho do localStorage
    loadCart();

    // Listener para atualizar quando o carrinho mudar
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sua_marca_cart") {
        loadCart();
      }
    };

    // Listener customizado para atualizações na mesma aba
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Verificar mudanças periodicamente (fallback)
    const interval = setInterval(loadCart, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    setItems(getCart());
    toast({
      title: "Item removido",
      description: "Item removido do carrinho.",
    });
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho primeiro.",
        variant: "destructive",
      });
      return;
    }

    router.push("/dashboard/checkout");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Carrinho</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
              <Link href="/dashboard/products">
                <Button>Escolher produtos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.designImageUrl}
                        alt="Estampa"
                        className="w-24 h-24 object-contain border rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.color} • {item.size} • {item.fabric}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                        <p className="font-semibold mt-2">
                          R$ {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>Calculado no checkout</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Prazo estimado: 7-14 dias úteis
                  </p>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Finalizar compra
                  </Button>

                  <Link href="/dashboard/products">
                    <Button variant="outline" className="w-full">
                      Continuar comprando
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


