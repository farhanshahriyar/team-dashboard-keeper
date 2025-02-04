import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { Edit2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MatchHistoryForm } from "./MatchHistoryForm";
import { useToast } from "@/hooks/use-toast";

type MatchHistory = Database['public']['Tables']['match_history']['Row'];

export function MatchHistoryTable() {
  const [editingMatch, setEditingMatch] = useState<MatchHistory | null>(null);
  const { toast } = useToast();
  
  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ['match-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_history')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as MatchHistory[];
    },
  });

  const handleUpdate = async (match: MatchHistory) => {
    try {
      const { error } = await supabase
        .from('match_history')
        .update({
          date: match.date,
          tier: match.tier,
          type: match.type,
          tournament: match.tournament,
          score: match.score,
          opponent: match.opponent,
        })
        .eq('id', match.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match history has been updated",
      });

      refetch();
      setEditingMatch(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match history",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tournament</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>VS Opponent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches?.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{format(new Date(match.date), 'PPP')}</TableCell>
                <TableCell>{match.tier}</TableCell>
                <TableCell>{match.type}</TableCell>
                <TableCell>{match.tournament}</TableCell>
                <TableCell>{match.score}</TableCell>
                <TableCell>{match.opponent}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingMatch(match)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
          </DialogHeader>
          {editingMatch && (
            <MatchHistoryForm 
              initialData={editingMatch}
              onSuccess={(updatedMatch) => handleUpdate(updatedMatch)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}