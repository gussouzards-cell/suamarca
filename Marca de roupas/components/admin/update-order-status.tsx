"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: string;
}

const statuses = [
  "PENDING",
  "IN_PRODUCTION",
  "STAMPING",
  "QUALITY_CHECK",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleUpdate} disabled={isUpdating || status === currentStatus}>
        {isUpdating ? "Atualizando..." : "Atualizar"}
      </Button>
    </div>
  );
}


