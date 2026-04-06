import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop as CropIcon, Loader2 } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  aspectRatio?: number;
  circularCrop?: boolean;
  onCropComplete: (blob: Blob) => void;
  title?: string;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspectRatio = 1,
  circularCrop = false,
  onCropComplete,
  title = "Recortar imagem",
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      setCrop(centerAspectCrop(naturalWidth, naturalHeight, aspectRatio));
    },
    [aspectRatio]
  );

  const handleConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    setProcessing(true);
    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
            onOpenChange(false);
          }
          setProcessing(false);
        },
        "image/jpeg",
        0.92
      );
    } catch {
      setProcessing(false);
    }
  }, [completedCrop, onCropComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Arraste para ajustar a área de recorte da imagem.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            circularCrop={circularCrop}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Imagem para recorte"
              onLoad={onImageLoad}
              className="max-h-[55vh] w-auto"
            />
          </ReactCrop>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={processing || !completedCrop}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar recorte"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
