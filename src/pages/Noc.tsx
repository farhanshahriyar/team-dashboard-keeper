import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, History } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NocHistoryDialog } from "@/components/NocHistoryDialog";
import { NocForm } from "@/components/noc/NocForm";
import { NocTable } from "@/components/noc/NocTable";
import type { NocRecord } from "@/types/noc";

export default function Noc() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<NocRecord | null>(null);
  const { toast } = useToast();

  const { data: nocRecords, refetch } = useQuery({
    queryKey: ['noc_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noc_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NocRecord[];
    },
  });

  const { data: nocHistory } = useQuery({
    queryKey: ['noc_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noc_history')
        .select('*')
        .order('action_timestamp', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (record: NocRecord) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('noc_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "NOC record deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('noc_records')
        .insert([{
          player_name: formData.get('player_name') as string,
          email: formData.get('email') as string,
          type: formData.get('type') as string,
          start_date: formData.get('start_date') as string,
          end_date: formData.get('end_date') as string,
          reason: formData.get('reason') as string,
          user_id: user.id,
          status: 'pending',
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "NOC record created successfully",
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      if (!selectedRecord) return;

      const { error } = await supabase
        .from('noc_records')
        .update({
          player_name: formData.get('player_name') as string,
          email: formData.get('email') as string,
          type: formData.get('type') as string,
          start_date: formData.get('start_date') as string,
          end_date: formData.get('end_date') as string,
          reason: formData.get('reason') as string,
          status: formData.get('status') as string,
        })
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "NOC record updated successfully",
      });
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NOC Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
            <History className="w-4 h-4 mr-2" />
            View History
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add NOC Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New NOC Record</DialogTitle>
                <DialogDescription>
                  Create a new NOC record entry
                </DialogDescription>
              </DialogHeader>
              <NocForm onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit NOC Record</DialogTitle>
            <DialogDescription>
              Update NOC record details
            </DialogDescription>
          </DialogHeader>
          <NocForm onSubmit={handleEditSubmit} initialData={selectedRecord} />
        </DialogContent>
      </Dialog>

      <NocHistoryDialog 
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        history={nocHistory || []}
      />

      <NocTable 
        records={nocRecords || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
}