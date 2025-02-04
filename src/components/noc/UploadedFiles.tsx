import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFilesProps {
  nocId: string;
}

export function UploadedFiles({ nocId }: UploadedFilesProps) {
  const { data: files } = useQuery({
    queryKey: ['uploaded_files', nocId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('noc_id', nocId);

      if (error) throw error;
      return data;
    },
  });

  if (!files?.length) {
    return <p className="text-sm text-muted-foreground">No files uploaded yet</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between">
          <span className="text-sm">{file.file_name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(file.file_url, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            View NOC
          </Button>
        </div>
      ))}
    </div>
  );
}