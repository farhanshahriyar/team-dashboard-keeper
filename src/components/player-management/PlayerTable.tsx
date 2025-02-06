import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerMetrics } from "./types";

interface PlayerTableProps {
  players: any[];
  metrics: { [key: string]: PlayerMetrics };
  onEditStatus: (playerId: string, currentStatus: string) => void;
  onEditStats: (playerId: string, currentStats: PlayerMetrics) => void;
  onDelete: (playerId: string) => void;
}

export const PlayerTable = ({
  players,
  metrics,
  onEditStatus,
  onEditStats,
  onDelete,
}: PlayerTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-700";
      case 'inactive':
        return "bg-yellow-100 text-yellow-700";
      case 'suspended':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">IGN</TableHead>
            <TableHead className="whitespace-nowrap">Mobile</TableHead>
            <TableHead className="whitespace-nowrap">Discord ID</TableHead>
            <TableHead className="whitespace-nowrap">Leave Days</TableHead>
            <TableHead className="whitespace-nowrap">Absent Days</TableHead>
            <TableHead className="whitespace-nowrap">NOC Days</TableHead>
            <TableHead className="whitespace-nowrap">Current Month</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players?.map((player) => {
            const playerMetrics = metrics[player.id];
            return (
              <TableRow key={player.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{player.ign}</TableCell>
                <TableCell>{player.phone}</TableCell>
                <TableCell>{player.discord_id}</TableCell>
                <TableCell>{playerMetrics.leaveDays}</TableCell>
                <TableCell>{playerMetrics.absentDays}</TableCell>
                <TableCell>{playerMetrics.nocDays}</TableCell>
                <TableCell>
                  L: {playerMetrics.currentMonthLeaves} A: {playerMetrics.currentMonthAbsents}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      playerMetrics.status
                    )}`}
                  >
                    {playerMetrics.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditStatus(player.id, playerMetrics.status)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditStats(player.id, playerMetrics)}
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(player.id)}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};