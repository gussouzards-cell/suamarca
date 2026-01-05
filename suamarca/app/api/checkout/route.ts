import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercado-pago";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { brands: { include: { designs: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const brand = user.brands[0];
    if (!brand) {
      return NextResponse.json(
        { error: "Crie uma marca primeiro" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paymentMethod, ...addressData } = body;

    // Calcular total (em produção, buscar do carrinho)
    const totalAmount = 100; // Placeholder

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        brandId: brand.id,
        totalAmount,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    if (paymentMethod === "pix") {
      // Criar pagamento PIX via Mercado Pago
      const result = await createPixPayment(
        totalAmount,
        `Pedido ${order.id}`,
        addressData.email
      );

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: result.id?.toString() },
      });

      return NextResponse.json({
        paymentId: result.id,
        qrCode: result.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      });
    } else {
      // Pagamento com cartão - redirecionar para checkout do Mercado Pago
      // Implementar preferência de pagamento
      return NextResponse.json({
        paymentUrl: "#", // URL do checkout do Mercado Pago
        orderId: order.id,
      });
    }
  } catch (error) {
    console.error("Erro no checkout:", error);
    return NextResponse.json(
      { error: "Erro ao processar checkout" },
      { status: 500 }
    );
  }
}

