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

type MatchHistory = Database['public']['Tables']['match_history']['Row'];

export function MatchHistoryTable() {
  const { data: matches, isLoading } = useQuery({
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}