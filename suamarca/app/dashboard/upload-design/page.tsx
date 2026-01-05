"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MockupCanvas } from "@/components/mockup-canvas";
import { Upload, Check, X } from "lucide-react";

export default function UploadDesignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shirtColor, setShirtColor] = useState("#ffffff");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validar formato
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast({
        title: "Formato inválido",
        description: "Apenas imagens PNG, JPG ou SVG são aceitas.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

      // Upload para servidor
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/designs/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setUploadedImage(data.imageUrl);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"],
    },
    maxFiles: 1,
  });

  const handleUseDesign = async () => {
    if (!uploadedImage) return;

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          isAIGenerated: false,
        }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Sucesso",
        description: "Estampa salva! Agora você pode escolher os produtos.",
      });

      router.push("/dashboard/designs");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a estampa.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = () => {
    setUploadedImage(null);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Subir minha estampa</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload de arquivo</CardTitle>
              <CardDescription>
                Faça upload da sua estampa (PNG, JPG ou SVG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!uploadedImage ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-primary">Solte o arquivo aqui...</p>
                  ) : (
                    <>
                      <p className="mb-2">
                        Arraste e solte sua estampa aqui, ou clique para selecionar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG ou SVG • Máximo 10MB
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Estampa enviada"
                      className="w-full rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemove}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor da camiseta (preview)</label>
                    <div className="flex gap-2">
                      {["#ffffff", "#000000", "#ff0000", "#0000ff", "#00ff00"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-10 h-10 rounded-full border-2 ${
                            shirtColor === color ? "border-primary" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setShirtColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isUploading && (
                <p className="text-center text-muted-foreground">Fazendo upload...</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {uploadedImage ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Preview na camiseta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MockupCanvas designUrl={uploadedImage} shirtColor={shirtColor} />
                  </CardContent>
                </Card>
                <Button
                  onClick={handleUseDesign}
                  className="w-full"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Usar esta estampa
                </Button>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Faça upload de uma estampa para ver o preview aqui</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


