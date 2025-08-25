import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon, Upload } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SimpleImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
}

export function SimpleImageUploader({ onImageUploaded }: SimpleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get upload URL
      const response = await apiRequest('POST', '/api/objects/upload', {}) as any;
      
      // Upload file
      const uploadResponse = await fetch(response.uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        // Get the uploaded file URL
        const uploadedUrl = response.uploadURL.split('?')[0];
        const normalizedUrl = `/objects/uploads/${uploadedUrl.split('/').pop()}`;
        onImageUploaded(normalizedUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="image-upload"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <ImageIcon className="w-4 h-4 mr-1" />
        {uploading ? 'Przesyłanie...' : 'Dodaj zdjęcie'}
      </Button>
    </div>
  );
}