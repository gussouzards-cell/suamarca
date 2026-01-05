"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Design {
  id: string;
  name: string | null;
  createdAt: Date;
}

interface DesignSelectorProps {
  designs: Design[];
  currentDesignId: string;
}

export function DesignSelector({ designs, currentDesignId }: DesignSelectorProps) {
  const router = useRouter();

  const handleDesignChange = (designId: string) => {
    router.push(`/dashboard/products?designId=${designId}`);
  };

  return (
    <Select value={currentDesignId} onValueChange={handleDesignChange}>
      <SelectTrigger className="w-full md:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {designs.map((design) => (
          <SelectItem key={design.id} value={design.id}>
            {design.name || `Estampa ${new Date(design.createdAt).toLocaleDateString("pt-BR")}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

