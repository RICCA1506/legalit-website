import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait";
}

export function ImageUpload({ 
  value, 
  onChange, 
  className,
  aspectRatio = "square"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]"
  };

  useEffect(() => {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("dragover", prevent);
    document.addEventListener("drop", prevent);
    return () => {
      document.removeEventListener("dragover", prevent);
      document.removeEventListener("drop", prevent);
    };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Seleziona un file immagine valido");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("L'immagine deve essere inferiore a 10MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Errore durante il caricamento");
      }

      const { url } = await response.json();
      onChange(url);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Errore durante il caricamento");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getImageSrc = (url: string) => {
    if (url.startsWith("/objects/")) {
      return url;
    }
    return url;
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-image-file"
      />

      {value ? (
        <div className="space-y-3">
          <div
            className={cn(
              "relative rounded-lg overflow-hidden bg-muted cursor-pointer transition-all",
              aspectClasses[aspectRatio],
              isDragging && "ring-2 ring-primary ring-offset-2"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            data-testid="dropzone-image-replace"
          >
            <img
              src={getImageSrc(value)}
              alt="Anteprima"
              className={cn("w-full h-full object-cover transition-opacity", isDragging && "opacity-30")}
            />
            {isDragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-primary" />
                <p className="text-sm font-medium text-primary">Rilascia per sostituire</p>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              data-testid="button-change-image"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Cambia foto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              data-testid="button-remove-image"
            >
              <X className="h-4 w-4 mr-1.5" />
              Rimuovi foto
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            aspectClasses[aspectRatio],
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-image"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragging ? "Rilascia qui l'immagine" : "Trascina un'immagine qui"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    oppure clicca per selezionare
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP fino a 10MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
