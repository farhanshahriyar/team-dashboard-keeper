import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NocRecord } from "@/types/noc";

interface NocTableProps {
  records: NocRecord[];
  onEdit: (record: NocRecord) => void;
  onDelete: (id: string) => void;
}

export function NocTable({ records, onEdit, onDelete }: NocTableProps) {
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

  return (
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
          {records?.map((record) => (
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
                    onClick={() => onEdit(record)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(record.id)}
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
  );
}