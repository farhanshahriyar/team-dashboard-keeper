import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NocRecord = {
  id: string;
  player_name: string;
  email: string;
  type: 'noc' | 'leave' | 'absent';  // Updated to match constraint
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'noc':
      return 'bg-red-500';
    case 'leave':
      return 'bg-blue-500';
    case 'absent':
      return 'bg-red-300';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500';
    case 'rejected':
      return 'bg-red-500';
    case 'under review':
      return 'bg-blue-500';
    case 'accepted':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default function Noc() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

      const type = (formData.get('type') as string).toLowerCase();
      if (!['noc', 'leave', 'absent'].includes(type)) {
        throw new Error('Invalid type selected');
      }

      const { error } = await supabase
        .from('noc_records')
        .insert([{
          player_name: formData.get('player_name') as string,
          email: formData.get('email') as string,
          type,
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

      const type = (formData.get('type') as string).toLowerCase();
      if (!['noc', 'leave', 'absent'].includes(type)) {
        throw new Error('Invalid type selected');
      }

      const { error } = await supabase
        .from('noc_records')
        .update({
          player_name: formData.get('player_name') as string,
          email: formData.get('email') as string,
          type,
          start_date: formData.get('start_date') as string,
          end_date: formData.get('end_date') as string,
          reason: formData.get('reason') as string,
          status: (formData.get('status') as string).toLowerCase(),
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

  const NocForm = ({ onSubmit, initialData = null }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, initialData?: NocRecord | null }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="player_name">Player Name</Label>
        <Input 
          id="player_name" 
          name="player_name" 
          defaultValue={initialData?.player_name} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          defaultValue={initialData?.email}
          required 
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={initialData?.type || 'noc'}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="noc">
              <span className="flex items-center">
                <Badge variant="secondary" className="bg-red-500 text-white mr-2">NOC</Badge>
                NOC
              </span>
            </SelectItem>
            <SelectItem value="leave">
              <span className="flex items-center">
                <Badge variant="secondary" className="bg-blue-500 text-white mr-2">Leave</Badge>
                Leave
              </span>
            </SelectItem>
            <SelectItem value="absent">
              <span className="flex items-center">
                <Badge variant="secondary" className="bg-red-300 text-white mr-2">Absent</Badge>
                Absent
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input 
          id="start_date" 
          name="start_date" 
          type="date" 
          defaultValue={initialData?.start_date}
          required 
        />
      </div>
      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input 
          id="end_date" 
          name="end_date" 
          type="date" 
          defaultValue={initialData?.end_date}
          required 
        />
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input 
          id="reason" 
          name="reason" 
          defaultValue={initialData?.reason}
          required 
        />
      </div>
      {initialData && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={initialData.status || 'pending'}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <span className="flex items-center">
                  <Badge variant="secondary" className="bg-yellow-500 text-white mr-2">Pending</Badge>
                  Pending
                </span>
              </SelectItem>
              <SelectItem value="rejected">
                <span className="flex items-center">
                  <Badge variant="secondary" className="bg-red-500 text-white mr-2">Rejected</Badge>
                  Rejected
                </span>
              </SelectItem>
              <SelectItem value="under review">
                <span className="flex items-center">
                  <Badge variant="secondary" className="bg-blue-500 text-white mr-2">Under Review</Badge>
                  Under Review
                </span>
              </SelectItem>
              <SelectItem value="accepted">
                <span className="flex items-center">
                  <Badge variant="secondary" className="bg-green-500 text-white mr-2">Accepted</Badge>
                  Accepted
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="w-full">
        {initialData ? 'Update NOC Record' : 'Create NOC Record'}
      </Button>
    </form>
  );

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NOC Management</h1>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nocRecords?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.player_name}</TableCell>
                <TableCell>{record.email}</TableCell>
                <TableCell>
                  <Badge className={cn(getTypeColor(record.type), "text-white")}>
                    {record.type}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(record.start_date), 'PP')}</TableCell>
                <TableCell>{format(new Date(record.end_date), 'PP')}</TableCell>
                <TableCell>{record.reason}</TableCell>
                <TableCell>
                  <Badge className={cn(getStatusColor(record.status), "text-white")}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};
