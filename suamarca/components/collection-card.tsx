"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Check, X, Image as ImageIcon } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count: {
    designs: number;
  };
  designs: Array<{
    id: string;
    imageUrl: string;
  }>;
}

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Coleção atualizada com sucesso!",
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coleção.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta coleção? As estampas não serão excluídas, apenas removidas da coleção.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Coleção excluída com sucesso!",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a coleção.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          {isEditing ? (
            <div className="flex-1 space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da coleção"
                className="font-semibold"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setName(collection.name);
                    setDescription(collection.description || "");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <CardTitle className="text-lg">{collection.name}</CardTitle>
                {collection.description && (
                  <CardDescription className="mt-1">
                    {collection.description}
                  </CardDescription>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {collection._count.designs} {collection._count.designs === 1 ? "estampa" : "estampas"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {collection.designs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {collection.designs.map((design) => (
              <div
                key={design.id}
                className="aspect-square bg-muted rounded-lg flex items-center justify-center p-2"
              >
                <img
                  src={design.imageUrl}
                  alt="Estampa"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        {!isEditing && (
          <Link href={`/dashboard/collections/${collection.id}`}>
            <Button className="w-full" variant="outline">
              Ver coleção
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

