import { prisma } from "./prisma";

export type PlanType = "FREE" | "PRO";

export interface UserLimits {
  canGenerateLogo: boolean;
  canGenerateDesign: boolean;
  logoGenerationsUsed: number;
  designGenerationsUsed: number;
  plan: PlanType;
  isPro: boolean;
}

const FREE_LOGO_LIMIT = 1;
const FREE_DESIGN_LIMIT = 1;

export async function checkUserLimits(userId: string): Promise<UserLimits> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const subscription = user.subscription;
  const isPro = subscription?.plan === "PRO" && subscription?.status === "ACTIVE";

  return {
    canGenerateLogo: isPro || user.aiLogoGenerations < FREE_LOGO_LIMIT,
    canGenerateDesign: isPro || user.aiDesignGenerations < FREE_DESIGN_LIMIT,
    logoGenerationsUsed: user.aiLogoGenerations,
    designGenerationsUsed: user.aiDesignGenerations,
    plan: isPro ? "PRO" : "FREE",
    isPro,
  };
}

export async function incrementLogoGeneration(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      aiLogoGenerations: { increment: 1 },
      aiGenerations: { increment: 1 },
    },
  });
}

export async function incrementDesignGeneration(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      aiDesignGenerations: { increment: 1 },
      aiGenerations: { increment: 1 },
    },
  });
}

