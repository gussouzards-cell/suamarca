import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verificar tipo de notificação
    if (body.type === "payment") {
      const paymentId = body.data.id;
      const paymentStatus = body.data.status;

      // Buscar pedido pelo paymentId
      const order = await prisma.order.findFirst({
        where: { paymentId: paymentId.toString() },
      });

      if (order) {
        // Atualizar status do pagamento do pedido
        const orderPaymentStatus = paymentStatus === "approved" ? "PAID" : "PENDING";
        
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: orderPaymentStatus,
            ...(orderPaymentStatus === "PAID" && { status: "IN_PRODUCTION" }),
          },
        });
      }

      // Verificar se é pagamento de assinatura (preferência)
      if (body.data.metadata?.userId && body.data.metadata?.plan) {
        const userId = body.data.metadata.userId;
        const plan = body.data.metadata.plan;

        if (paymentStatus === "approved") {
          // Ativar assinatura
          await prisma.subscription.updateMany({
            where: {
              userId: userId,
              plan: plan,
            },
            data: {
              status: "ACTIVE",
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}


