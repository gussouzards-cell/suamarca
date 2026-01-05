import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se já tem assinatura ativa
    if (user.subscription && user.subscription.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Você já possui uma assinatura ativa" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { plan, price } = body;

    if (plan !== "PRO") {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // Verificar se Mercado Pago está configurado
    const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!mercadoPagoToken) {
      // Modo de desenvolvimento: criar assinatura diretamente sem pagamento
      console.warn("MERCADOPAGO_ACCESS_TOKEN não configurado. Criando assinatura em modo de desenvolvimento.");
      
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan: plan,
          status: "ACTIVE",
          price: price,
          currency: "BRL",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
        create: {
          userId: user.id,
          plan: plan,
          status: "ACTIVE",
          price: price,
          currency: "BRL",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        paymentUrl: null,
        message: "Assinatura criada em modo de desenvolvimento (Mercado Pago não configurado)",
        development: true,
      });
    }

    // Criar preferência de pagamento no Mercado Pago
    try {
      const { MercadoPagoConfig, Preference } = await import("mercadopago");
      
      const client = new MercadoPagoConfig({
        accessToken: mercadoPagoToken,
      });

      const preference = new Preference(client);

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      
      const paymentData = {
        items: [
          {
            id: `plan-pro-${user.id}`,
            title: `Plano PRO - Sua Marca`,
            quantity: 1,
            unit_price: price,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${baseUrl}/dashboard/plans/success`,
          failure: `${baseUrl}/dashboard/plans/failure`,
          pending: `${baseUrl}/dashboard/plans/pending`,
        },
        auto_return: "approved",
        metadata: {
          userId: user.id,
          plan: plan,
        },
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      };

      const response = await preference.create({ body: paymentData });

      // Criar registro de assinatura pendente
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan: plan,
          status: "PENDING",
          price: price,
          currency: "BRL",
          startDate: new Date(),
        },
        create: {
          userId: user.id,
          plan: plan,
          status: "PENDING",
          price: price,
          currency: "BRL",
          startDate: new Date(),
        },
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        paymentUrl: response.init_point || response.sandbox_init_point,
        preferenceId: response.id,
      });
    } catch (mpError: any) {
      console.error("Erro ao criar preferência no Mercado Pago:", mpError);
      return NextResponse.json(
        { 
          error: "Erro ao criar pagamento no Mercado Pago", 
          details: mpError.message || "Verifique se o MERCADOPAGO_ACCESS_TOKEN está correto" 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao criar assinatura:", error);
    return NextResponse.json(
      { 
        error: "Erro ao criar assinatura", 
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

