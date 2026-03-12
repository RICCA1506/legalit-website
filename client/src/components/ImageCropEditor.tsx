import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

interface ImageCropEditorProps {
  imageUrl: string;
  initialOffsetX?: number;
  initialOffsetY?: number;
  initialZoom?: number;
  onConfirm: (offsetX: number, offsetY: number, zoom: number) => void;
  onCancel?: () => void;
  aspectRatio?: number;
}

export default function ImageCropEditor({
  imageUrl,
  initialOffsetX = 50,
  initialOffsetY = 50,
  initialZoom = 100,
  onConfirm,
  onCancel,
  aspectRatio = 3 / 4,
}: ImageCropEditorProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [offsetX, setOffsetX] = useState(initialOffsetX);
  const [offsetY, setOffsetY] = useState(initialOffsetY);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const clampOffset = useCallback((ox: number, oy: number) => {
    return {
      x: Math.max(0, Math.min(100, ox)),
      y: Math.max(0, Math.min(100, oy)),
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragStartOffset({ x: offsetX, y: offsetY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [offsetX, offsetY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * 100;
    const newOx = dragStartOffset.x - dx;
    const newOy = dragStartOffset.y - dy;
    const clamped = clampOffset(newOx, newOy);
    setOffsetX(clamped.x);
    setOffsetY(clamped.y);
  }, [isDragging, dragStart, dragStartOffset, clampOffset]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom(prev => Math.max(100, Math.min(250, prev + delta)));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(250, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(100, prev - 10));
  };

  const handleReset = () => {
    setZoom(100);
    setOffsetX(50);
    setOffsetY(50);
  };

  const resolvedUrl = imageUrl.startsWith("http") || imageUrl.startsWith("/")
    ? imageUrl
    : `/objects/${imageUrl}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <p className="text-sm font-medium">Inquadra la foto</p>
        <p className="text-xs text-muted-foreground">
          Trascina per spostare, zoom per ingrandire
        </p>
      </div>

      <div className="flex gap-4 items-start">
        <div
          ref={containerRef}
          className="relative w-48 rounded-lg overflow-hidden border-2 border-primary/30 cursor-grab active:cursor-grabbing select-none touch-none flex-shrink-0"
          style={{ aspectRatio: `${aspectRatio}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          data-testid="image-crop-editor"
        >
          <img
            src={resolvedUrl}
            alt="Crop preview"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              objectPosition: `${offsetX}% ${offsetY}%`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: `${offsetX}% ${offsetY}%`,
            }}
            draggable={false}
          />
          <div className="absolute inset-0 border-2 border-white/40 rounded-lg pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "33.333% 33.333%",
            }} />
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs text-muted-foreground mb-1">
            Anteprima card
          </p>
          <div
            className="w-20 rounded-md overflow-hidden border bg-muted/30"
            style={{ aspectRatio: `${aspectRatio}` }}
          >
            <img
              src={resolvedUrl}
              alt="Card preview"
              className="w-full h-full object-cover pointer-events-none"
              style={{
                objectPosition: `${offsetX}% ${offsetY}%`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: `${offsetX}% ${offsetY}%`,
              }}
              draggable={false}
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 100}
              data-testid="btn-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-xs font-medium">{zoom}%</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 250}
              data-testid="btn-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <input
            type="range"
            min={100}
            max={250}
            step={5}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-full accent-primary h-1.5 cursor-pointer"
            data-testid="slider-crop-zoom"
          />

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleReset}
              data-testid="btn-crop-reset"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs flex-1"
              onClick={() => onConfirm(Math.round(offsetX), Math.round(offsetY), zoom)}
              data-testid="btn-crop-confirm"
            >
              <Check className="h-3 w-3 mr-1" />
              Conferma
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
