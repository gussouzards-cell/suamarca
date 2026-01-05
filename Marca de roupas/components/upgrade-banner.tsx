"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

interface UpgradeBannerProps {
  type: "logo" | "design";
  limits: {
    logoGenerationsUsed: number;
    designGenerationsUsed: number;
    plan: string;
  };
}

export function UpgradeBanner({ type, limits }: UpgradeBannerProps) {
  const isLogo = type === "logo";
  const used = isLogo ? limits.logoGenerationsUsed : limits.designGenerationsUsed;
  const limit = 1;

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle>Limite de gerações atingido</CardTitle>
        </div>
        <CardDescription>
          Você já usou {used} de {limit} {isLogo ? "geração de logotipo" : "geração de estampa"} gratuita.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para gerar {isLogo ? "logotipos" : "estampas"} ilimitados, faça upgrade para o plano PRO.
          </p>
          <Link href="/dashboard/plans">
            <Button className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Fazer upgrade para PRO
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

