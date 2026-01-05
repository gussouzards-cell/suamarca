"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Move, Maximize2, Minimize2 } from "lucide-react";

interface MockupCanvasProps {
  designUrl: string;
  shirtColor?: string;
  onSave?: (imageData: string) => void;
}

export function MockupCanvas({ designUrl, shirtColor = "#ffffff", onSave }: MockupCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawShirt = () => {
      canvas.width = 800;
      canvas.height = 1000;

      // Fundo branco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar silhueta da camiseta
      ctx.fillStyle = shirtColor;
      
      // Corpo principal
      ctx.beginPath();
      ctx.ellipse(400, 200, 180, 200, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Manga esquerda
      ctx.beginPath();
      ctx.ellipse(300, 400, 80, 120, -0.3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Manga direita
      ctx.beginPath();
      ctx.ellipse(500, 400, 80, 120, 0.3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Corpo inferior
      ctx.fillRect(220, 400, 360, 500);
    };

    drawShirt();

    // Carregar e aplicar estampa
    const designImg = new Image();
    designImg.crossOrigin = "anonymous";
    designImg.onload = () => {
      // Redesenhar camiseta
      drawShirt();
      
      const centerX = canvas.width / 2 + position.x;
      const centerY = canvas.height / 2 + position.y;
      const maxWidth = 400;
      const maxHeight = 400;
      
      let imgWidth = designImg.width * scale;
      let imgHeight = designImg.height * scale;
      
      // Ajustar proporção se necessário
      if (imgWidth > maxWidth) {
        const ratio = maxWidth / imgWidth;
        imgWidth = maxWidth;
        imgHeight = imgHeight * ratio;
      }
      if (imgHeight > maxHeight) {
        const ratio = maxHeight / imgHeight;
        imgHeight = maxHeight;
        imgWidth = imgWidth * ratio;
      }
      
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(
        designImg,
        centerX - imgWidth / 2,
        centerY - imgHeight / 2,
        imgWidth,
        imgHeight
      );
      ctx.restore();
    };
    designImg.onerror = () => {
      console.error("Erro ao carregar imagem da estampa");
    };
    designImg.src = designUrl;
  }, [designUrl, shirtColor, scale, position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleCenter = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCenter}
        >
          <Move className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="border rounded-lg cursor-move max-w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Arraste para mover • Use os botões para ajustar o tamanho
      </p>
    </div>
  );
}

