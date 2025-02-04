import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  nocId: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ nocId, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${nocId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('noc_applications')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('noc_applications')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          noc_id: nocId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file">Upload Application</Label>
        <Input
          id="file"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.docx"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}