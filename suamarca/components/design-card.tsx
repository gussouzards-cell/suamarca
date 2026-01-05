"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Check, X, Tag } from "lucide-react";

interface Design {
  id: string;
  name: string | null;
  imageUrl: string;
  prompt: string | null;
  isAIGenerated: boolean;
  createdAt: Date;
  collection: {
    id: string;
    name: string;
  } | null;
}

interface Collection {
  id: string;
  name: string;
}

interface DesignCardProps {
  design: Design;
  collections: Collection[];
}

export function DesignCard({ design, collections }: DesignCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(design.name || "");
  const [collectionId, setCollectionId] = useState(design.collection?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          collectionId: collectionId || null,
        }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Estampa atualizada com sucesso!",
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a estampa.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta estampa?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/designs/${design.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Estampa excluída com sucesso!",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a estampa.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted flex items-center justify-center p-4 relative group">
        <img
          src={design.imageUrl}
          alt={design.name || "Estampa"}
          className="max-w-full max-h-full object-contain"
        />
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardHeader>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da estampa"
              className="text-lg font-semibold"
            />
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Sem coleção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem coleção</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setName(design.name || "");
                  setCollectionId(design.collection?.id || "");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <CardTitle className="text-lg">
              {design.name || (design.isAIGenerated ? "Estampa gerada por IA" : "Estampa enviada")}
            </CardTitle>
            <CardDescription>
              {design.prompt && (
                <p className="text-sm mt-1 line-clamp-2">{design.prompt}</p>
              )}
              {design.collection && (
                <div className="flex items-center gap-1 mt-2">
                  <Tag className="h-3 w-3" />
                  <span className="text-xs">{design.collection.name}</span>
                </div>
              )}
              <p className="text-xs mt-2">
                {new Date(design.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </CardDescription>
          </>
        )}
      </CardHeader>
      {!isEditing && (
        <CardContent>
          <div className="flex gap-2">
            <Link href={`/dashboard/products?designId=${design.id}`} className="flex-1">
              <Button className="w-full" size="sm">
                Usar esta estampa
              </Button>
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

