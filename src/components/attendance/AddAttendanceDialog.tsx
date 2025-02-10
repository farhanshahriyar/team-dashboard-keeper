
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/integrations/supabase/types";

type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface AddAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  selectedDate: Date;
}

export function AddAttendanceDialog({ 
  open, 
  onOpenChange, 
  members, 
  selectedDate 
}: AddAttendanceDialogProps) {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedMember || !status) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('daily_attendance')
        .upsert({
          team_member_id: selectedMember,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance record has been saved",
      });

      queryClient.invalidateQueries({ 
        queryKey: ['attendance', format(selectedDate, 'yyyy-MM-dd')] 
      });
      
      onOpenChange(false);
      setSelectedMember("");
      setStatus("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attendance Record</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Team Member</Label>
            <Select
              value={selectedMember}
              onValueChange={setSelectedMember}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.real_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="noc">NOC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
