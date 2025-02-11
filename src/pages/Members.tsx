
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AddMemberForm } from "@/components/AddMemberForm";
import { Edit, Download, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Member = Database['public']['Tables']['team_members']['Row'];
type NewMember = Omit<Member, 'id' | 'created_at' | 'user_id'>;

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchMembers();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (formData: NewMember) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .insert([{ ...formData, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member added successfully",
      });
      
      setDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleUpdate = async (formData: NewMember) => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', editingMember.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
      
      setDialogOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (member: Member) => {
    toast({
      title: "Confirm deletion",
      description: `Are you sure you want to delete ${member.real_name}?`,
      action: (
        <Button
          variant="destructive"
          onClick={() => handleDelete(member.id)}
          className="bg-[#DC2626] hover:bg-[#DC2626]/90"
        >
          Delete
        </Button>
      ),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
      
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error deleting member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Email",
      "Real Name",
      "Birthdate",
      "Phone",
      "IGN",
      "Game Role",
      "Discord ID",
      "Facebook"
    ];

    const csvData = members.map(member => [
      member.email,
      member.real_name,
      member.birthdate,
      member.phone,
      member.ign,
      member.game_role,
      member.discord_id,
      member.facebook
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "team_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white">Team Members</h1>
            <p className="text-gray-400 mt-1 text-sm">Manage your team's information</p>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingMember(null);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white">Add Team Member</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/50 backdrop-blur-xl border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
                </DialogHeader>
                <AddMemberForm 
                  onSubmit={editingMember ? handleUpdate : handleAddMember}
                  initialData={editingMember || undefined}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-white/10 bg-background/50 backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-400">Picture</TableHead>
                <TableHead className="text-gray-400">Real Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">IGN</TableHead>
                <TableHead className="text-gray-400">Game Role</TableHead>
                <TableHead className="text-gray-400">Discord ID</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    {member.picture ? (
                      <img
                        src={member.picture}
                        alt={member.real_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                        {member.real_name.charAt(0)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-white">{member.real_name}</TableCell>
                  <TableCell className="text-gray-300">{member.email}</TableCell>
                  <TableCell className="text-gray-300">{member.ign}</TableCell>
                  <TableCell className="capitalize text-gray-300">{member.game_role}</TableCell>
                  <TableCell className="text-gray-300">{member.discord_id}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(member)}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(member)}
                        className="text-gray-400 hover:text-[#DC2626] hover:bg-[#DC2626]/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No team members found. Add your first member!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
