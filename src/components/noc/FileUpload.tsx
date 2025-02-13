
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FileUploadProps {
  nocId: string;
  onUploadComplete?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export function FileUpload({ nocId, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateFile = (file: File): string | null => {
    if (!file) return "No file selected";
    if (file.size > MAX_FILE_SIZE) return "File size must be less than 5MB";
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "File type not supported. Please upload JPG, PNG, PDF, or DOC files";
    }
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Sanitize filename and create unique path
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
      const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${nocId}/${uniqueFileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('noc_applications')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('noc_applications')
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          noc_id: nocId,
          user_id: user.id,
          file_url: publicUrl,
          file_name: sanitizedFileName,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      // Success handling
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      // Invalidate queries to refresh the file list
      queryClient.invalidateQueries({ queryKey: ['uploaded_files', nocId] });

      // Reset input
      e.target.value = '';
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Upload Application</Label>
        <Input
          id="file"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground">
          Supported formats: JPG, PNG, PDF, DOC. Max size: 5MB
        </p>
      </div>
      {isUploading && (
        <div className="text-sm text-muted-foreground animate-pulse">
          Uploading...
        </div>
      )}
    </div>
  );
}
