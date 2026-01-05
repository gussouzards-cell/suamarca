// Utilitários para gerenciar carrinho no localStorage

export interface CartItem {
  id: string;
  productId: string;
  designId: string;
  productName: string;
  designImageUrl: string;
  color: string;
  size: string;
  fabric: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const CART_STORAGE_KEY = "sua_marca_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, "id" | "subtotal">): CartItem {
  if (typeof window === "undefined") {
    throw new Error("addToCart só pode ser chamado no cliente");
  }

  const cart = getCart();
  
  // Verificar se já existe um item idêntico (mesmo produto, design, cor, tamanho, tecido)
  const existingItemIndex = cart.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId &&
      cartItem.designId === item.designId &&
      cartItem.color === item.color &&
      cartItem.size === item.size &&
      cartItem.fabric === item.fabric
  );

  let newItem: CartItem;

  if (existingItemIndex > -1) {
    // Se já existe, aumentar a quantidade
    newItem = {
      ...cart[existingItemIndex],
      quantity: cart[existingItemIndex].quantity + item.quantity,
      subtotal: (cart[existingItemIndex].quantity + item.quantity) * item.unitPrice,
    };
    cart[existingItemIndex] = newItem;
  } else {
    // Criar novo item
    newItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      subtotal: item.unitPrice * item.quantity,
    };
    cart.push(newItem);
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  // Disparar evento customizado para atualizar outras abas/componentes
  window.dispatchEvent(new Event("cartUpdated"));
  
  return newItem;
}

export function removeFromCart(itemId: string): void {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== itemId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  
  // Disparar evento customizado
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.subtotal, 0);
}

