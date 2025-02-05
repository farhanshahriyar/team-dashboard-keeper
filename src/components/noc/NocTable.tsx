import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NocRecord } from "@/types/noc";
import * as XLSX from 'xlsx';

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

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = records.map(record => ({
      'Player Name': record.player_name,
      'Email': record.email,
      'Type': record.type,
      'Start Date': format(new Date(record.start_date), 'PP'),
      'End Date': format(new Date(record.end_date), 'PP'),
      'Reason': record.reason,
      'Status': record.status,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NOC Records');

    // Generate file name with current date
    const fileName = `noc_records_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={exportToExcel}
          className="mb-4"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>
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
    </div>
  );
}