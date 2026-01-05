import { MercadoPagoConfig, Payment } from "mercadopago";

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn("MERCADOPAGO_ACCESS_TOKEN não configurada");
}

export const mercadoPagoClient = process.env.MERCADOPAGO_ACCESS_TOKEN
  ? new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    })
  : null;

export async function createPixPayment(amount: number, description: string, payerEmail: string) {
  if (!mercadoPagoClient) {
    throw new Error("Mercado Pago não configurado");
  }

  const payment = new Payment(mercadoPagoClient);

  const paymentData = {
    transaction_amount: amount,
    description,
    payment_method_id: "pix",
    payer: {
      email: payerEmail,
    },
  };

  return await payment.create({ body: paymentData });
}


