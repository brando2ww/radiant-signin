import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseSupabaseUploadProps {
  bucket: string;
  folder?: string;
}

export function useSupabaseUpload({ bucket, folder }: UseSupabaseUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (file: File, fileName: string): Promise<string | null> => {
    if (!user) {
      setUploadError(new Error('Usuário não autenticado'));
      return null;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = folder 
        ? `${folder}/${fileName}.${fileExt}`
        : `${fileName}.${fileExt}`;

      // Deletar arquivo existente se houver
      await supabase.storage
        .from(bucket)
        .remove([filePath]);

      // Upload do novo arquivo
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setUploading(false);
      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError(error);
      setUploading(false);
      return null;
    }
  }, [user, bucket, folder]);

  return {
    uploadFile,
    uploading,
    uploadError,
  };
}
