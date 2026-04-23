import { useState, useRef, useCallback } from "react";
import { getCsrfToken } from "@/lib/queryClient";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: string | null;
  fileName?: string | null;
  onChange: (url: string | null, name: string | null) => void;
  className?: string;
  accept?: string;
}

export function FileUpload({ 
  value, 
  fileName,
  onChange, 
  className,
  accept = ".pdf,.doc,.docx"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError("Seleziona un file PDF o Word valido");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Il file deve essere inferiore a 20MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Errore durante la preparazione dell'upload");
      }

      const { uploadUrl, objectPath } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Errore durante il caricamento");
      }

      onChange(objectPath, file.name);
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
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
            "flex flex-col items-center justify-center gap-2 text-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            isUploading && "pointer-events-none opacity-50"
          )}
          data-testid="dropzone-file"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Trascina un documento qui o clicca per selezionare
              </p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 20MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName || "Documento"}</p>
              <p className="text-xs text-muted-foreground">Documento allegato</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
