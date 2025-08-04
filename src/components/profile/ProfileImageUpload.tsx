import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface ProfileImageUploadProps {
  userId: string;
  currentImage?: string | null;
  onUploadComplete: (url: string) => void;
}

export function ProfileImageUpload({ userId, currentImage, onUploadComplete }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Delete old image if exists
      if (currentImage) {
        const oldPath = currentImage.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profiles')
            .remove([oldPath]);
        }
      }

      onUploadComplete(data.publicUrl);
      
      toast({
        title: 'Success',
        description: 'Profile image updated successfully'
      });
    } catch (error: Error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor="profileImage">
        <Button 
          variant="outline" 
          disabled={uploading}
          className="cursor-pointer"
          asChild
        >
          <div>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </div>
        </Button>
      </label>
      <input
        type="file"
        id="profileImage"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        style={{ display: 'none' }}
      />
    </div>
  );
}
