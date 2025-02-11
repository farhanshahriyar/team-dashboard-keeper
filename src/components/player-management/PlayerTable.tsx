
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
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case 'inactive':
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case 'suspended':
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <div className="rounded-md border border-white/10 overflow-x-auto neo-blur">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-gray-400">IGN</TableHead>
            <TableHead className="text-gray-400">Mobile</TableHead>
            <TableHead className="text-gray-400">Discord ID</TableHead>
            <TableHead className="text-gray-400">Leave Days</TableHead>
            <TableHead className="text-gray-400">Absent Days</TableHead>
            <TableHead className="text-gray-400">NOC Days</TableHead>
            <TableHead className="text-gray-400">Current Month</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players?.map((player) => (
            <TableRow 
              key={player.id} 
              className="border-white/10 hover:bg-white/[0.02] transition-colors duration-200"
            >
              <TableCell className="font-medium text-white">{player.ign}</TableCell>
              <TableCell className="text-gray-300">{player.phone}</TableCell>
              <TableCell className="text-gray-300">{player.discord_id}</TableCell>
              <TableCell className="text-gray-300">{player.leave_days || 0}</TableCell>
              <TableCell className="text-gray-300">{player.absent_days || 0}</TableCell>
              <TableCell className="text-gray-300">{player.noc_days || 0}</TableCell>
              <TableCell className="text-gray-300">
                L: {player.current_month_leaves || 0} A: {player.current_month_absents || 0}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(player.status || 'active')}`}
                >
                  {player.status || 'Active'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditStatus(player.id, player.status || 'Active')}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditStats(player.id, metrics[player.id])}
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(player.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
