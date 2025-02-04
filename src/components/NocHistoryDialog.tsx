import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";

type NocHistoryEntry = {
  id: string;
  player_name: string;
  email: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  action: string;
  action_timestamp: string;
};

interface NocHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  history: NocHistoryEntry[];
}

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'created':
      return 'bg-green-500';
    case 'updated':
      return 'bg-blue-500';
    case 'deleted':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export function NocHistoryDialog({ isOpen, onOpenChange, history }: NocHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            NOC History
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Player Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge className={cn(getActionColor(entry.action), "text-white")}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.player_name}</TableCell>
                  <TableCell>{entry.type}</TableCell>
                  <TableCell>{entry.status}</TableCell>
                  <TableCell>{format(new Date(entry.start_date), 'PP')}</TableCell>
                  <TableCell>{format(new Date(entry.end_date), 'PP')}</TableCell>
                  <TableCell>{format(new Date(entry.action_timestamp), 'PPp')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}