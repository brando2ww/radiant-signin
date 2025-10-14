import { useCharacterLimit } from "@/hooks/use-character-limit";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const id = useId();
  const { user, profile, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(profile?.full_name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(profile?.full_name?.split(' ').slice(1).join(' ') || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const maxLength = 180;
  const {
    value,
    characterCount,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue: profile?.bio || "",
  });

  const { uploadFile: uploadAvatar, uploading: uploadingAvatar } = useSupabaseUpload({
    bucket: 'avatars',
    folder: user?.id,
  });

  const { uploadFile: uploadCover, uploading: uploadingCover } = useSupabaseUpload({
    bucket: 'avatars',
    folder: user?.id,
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let avatarUrl = profile?.avatar_url;
      let coverUrl = profile?.cover_image_url;

      // Upload de avatar se houver
      if (avatarFile) {
        const url = await uploadAvatar(avatarFile, 'avatar');
        if (url) avatarUrl = url;
      }

      // Upload de cover se houver
      if (coverFile) {
        const url = await uploadCover(coverFile, 'cover');
        if (url) coverUrl = url;
      }

      // Atualizar perfil
      const { error } = await updateProfile({
        full_name: `${firstName} ${lastName}`.trim(),
        bio: value,
        avatar_url: avatarUrl,
        cover_image_url: coverUrl,
      });

      if (error) {
        toast.error('Erro ao salvar perfil');
        return;
      }

      toast.success('Perfil atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Editar perfil
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Faça alterações no seu perfil. Você pode alterar sua foto e definir suas informações.
        </DialogDescription>
        <div className="overflow-y-auto">
          <ProfileBg 
            defaultImage={profile?.cover_image_url || undefined} 
            onFileSelect={setCoverFile}
          />
          <Avatar 
            defaultImage={profile?.avatar_url || undefined}
            onFileSelect={setAvatarFile}
          />
          <div className="px-6 pb-6 pt-4">
            <form className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`}>Nome</Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="Seu nome"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`}>Sobrenome</Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="Seu sobrenome"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <div className="relative">
                  <Input
                    id={`${id}-email`}
                    className="peer pe-9"
                    placeholder="Email"
                    defaultValue={user?.email || ''}
                    type="email"
                    disabled
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              {profile?.document && (
                <div className="space-y-2">
                  <Label htmlFor={`${id}-document`}>
                    {profile.document_type?.toUpperCase()}
                  </Label>
                  <Input
                    id={`${id}-document`}
                    placeholder="Documento"
                    defaultValue={profile.document}
                    type="text"
                    disabled
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`}>Biografia</Label>
                <Textarea
                  id={`${id}-bio`}
                  placeholder="Escreva algumas frases sobre você"
                  defaultValue={value}
                  maxLength={maxLength}
                  onChange={handleChange}
                  aria-describedby={`${id}-description`}
                />
                <p
                  id={`${id}-description`}
                  className="mt-2 text-right text-xs text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  <span className="tabular-nums">{limit - characterCount}</span> caracteres restantes
                </p>
              </div>
            </form>
          </div>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving || uploadingAvatar || uploadingCover}
          >
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileBg({ defaultImage, onFileSelect }: { defaultImage?: string; onFileSelect?: (file: File) => void }) {
  const [hideDefault, setHideDefault] = useState(false);
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } =
    useImageUpload({ onFileSelect });

  const currentImage = previewUrl || (!hideDefault ? defaultImage : null);

  const handleImageRemove = () => {
    handleRemove();
    setHideDefault(true);
  };

  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-muted">
        {currentImage && (
          <img
            className="h-full w-full object-cover"
            src={currentImage}
            alt={previewUrl ? "Pré-visualização da imagem carregada" : "Fundo do perfil padrão"}
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            aria-label={currentImage ? "Alterar imagem" : "Carregar imagem"}
          >
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          {currentImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              onClick={handleImageRemove}
              aria-label="Remover imagem"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Carregar arquivo de imagem"
      />
    </div>
  );
}

function Avatar({ defaultImage, onFileSelect }: { defaultImage?: string; onFileSelect?: (file: File) => void }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload({ onFileSelect });

  const currentImage = previewUrl || defaultImage;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm shadow-black/10">
        {currentImage && (
          <img
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="Imagem do perfil"
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          aria-label="Alterar foto do perfil"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Carregar foto do perfil"
        />
      </div>
    </div>
  );
}
