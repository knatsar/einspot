import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Image } from '@/components/ui/image';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  previewUrl?: string;
  bucket?: string;
  folder?: string;
  maxSize?: number; // in MB
  aspectRatio?: number;
}

export function ImageUpload({
  onUpload,
  previewUrl,
  bucket = 'public',
  folder = 'uploads',
  maxSize = 5, // 5MB default
  aspectRatio,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Create image object to check dimensions
      if (aspectRatio) {
        const img = new Image();
        const imageUrl = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        URL.revokeObjectURL(imageUrl);

        const actualRatio = img.width / img.height;
        const tolerance = 0.1; // 10% tolerance
        if (Math.abs(actualRatio - aspectRatio) > tolerance) {
          throw new Error(`Image must have an aspect ratio of ${aspectRatio}`);
        }
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(previewUrl || null);
    } finally {
      setUploading(false);
    }
  }, [aspectRatio, bucket, folder, onUpload, previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${error ? 'border-destructive' : ''}
        `}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative aspect-video w-full">                        <Image
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                          aspectRatio={aspectRatio}
                        />
          </div>
        ) : (
          <div className="py-8">
            {isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>Drag &apos;n&apos; drop an image here, or click to select</p>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {preview && (
        <Button
          variant="outline"
          onClick={() => {
            setPreview(null);
            onUpload('');
          }}
        >
          Remove Image
        </Button>
      )}
    </div>
  );
}
