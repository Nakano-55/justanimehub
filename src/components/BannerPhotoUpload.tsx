 
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cropper from 'react-easy-crop';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Upload, X, Check } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface BannerPhotoUploadProps {
  userId: string;
  currentBannerUrl?: string | null;
  onSuccess?: (url: string) => void;
  lang: Language;
}

const translations = {
  en: {
    dragDrop: 'Drag and drop your banner here, or click to select',
    uploadButton: 'Upload Banner',
    cancelButton: 'Cancel',
    saveButton: 'Save',
    success: 'Banner photo updated successfully',
    error: 'Failed to update banner photo',
    invalidFile: 'Please upload an image file (JPG, PNG, or GIF)',
    fileTooLarge: 'File size must be less than 5MB',
    recommendedSize: 'Recommended size: 1500x500 pixels',
  },
  id: {
    dragDrop: 'Tarik dan lepas banner Anda di sini, atau klik untuk memilih',
    uploadButton: 'Unggah Banner',
    cancelButton: 'Batal',
    saveButton: 'Simpan',
    success: 'Foto banner berhasil diperbarui',
    error: 'Gagal memperbarui foto banner',
    invalidFile: 'Harap unggah file gambar (JPG, PNG, atau GIF)',
    fileTooLarge: 'Ukuran file harus kurang dari 5MB',
    recommendedSize: 'Ukuran yang disarankan: 1500x500 piksel',
  },
} as const;

export function BannerPhotoUpload({ userId, currentBannerUrl, onSuccess, lang }: BannerPhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: t.invalidFile,
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB for banner)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: t.fileTooLarge,
        variant: 'destructive',
      });
      return;
    }

    // Clean up previous preview
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  }, [t, toast, preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      // Delete old banner if exists
      if (currentBannerUrl) {
        const oldPath = currentBannerUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('banners')
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Upload new banner with timestamp
      const fileExt = selectedFile.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${userId}/banner-${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, selectedFile, {
          cacheControl: 'no-cache',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL and add cache buster
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // Add timestamp as query parameter
      const urlWithTimestamp = `${publicUrl}?t=${timestamp}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          banner_url: urlWithTimestamp,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        description: t.success,
      });

      onSuccess?.(urlWithTimestamp);
      setSelectedFile(null);
      setPreview(null);

    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'Error',
        description: t.error,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-neutral-700 hover:border-violet-500/50'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-4 text-neutral-400" />
          <p className="text-neutral-400">{t.dragDrop}</p>
          <p className="text-sm text-neutral-500 mt-2">{t.recommendedSize}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-[3/1] w-full max-w-4xl mx-auto overflow-hidden rounded-lg">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (preview) {
                  URL.revokeObjectURL(preview);
                }
                setSelectedFile(null);
                setPreview(null);
              }}
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              {t.cancelButton}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-violet-600 hover:bg-violet-500"
            >
              <Check className="w-4 h-4 mr-2" />
              {t.saveButton}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}