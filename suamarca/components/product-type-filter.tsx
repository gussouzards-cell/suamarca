"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Shirt, ShirtIcon } from "lucide-react";

const productTypes = [
  { value: "all", label: "Todos", icon: Shirt },
  { value: "camiseta", label: "Camisetas Básicas", icon: Shirt },
  { value: "camiseta-oversized", label: "Oversized", icon: ShirtIcon },
  { value: "regata", label: "Regatas", icon: ShirtIcon },
];

function ProductTypeFilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type") || "all";

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`/dashboard/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {productTypes.map((type) => {
        const Icon = type.icon;
        return (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange(type.value)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {type.label}
          </Button>
        );
      })}
    </div>
  );
}

export function ProductTypeFilter() {
  return (
    <Suspense fallback={<div className="flex gap-2 mb-6"><div className="h-9 w-24 bg-muted animate-pulse rounded" /></div>}>
      <ProductTypeFilterContent />
    </Suspense>
  );
}

