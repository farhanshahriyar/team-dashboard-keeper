import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockPlayers = [
  {
    id: 1,
    mobile: "+1234567890",
    ign: "ProGamer123",
    metrics: {
      totalLeaves: 3,
      totalAbsent: 1,
      totalNOCs: 2,
      pendingNOCs: 0,
      activeDays: 180,
      lastActive: "2024-02-20",
      totalGamingHours: 120,
    },
    contact: {
      email: "john.doe@example.com",
      discordId: "ProGamer#1234",
      status: "Active",
    },
  },
  {
    id: 2,
    mobile: "+1987654321",
    ign: "TacticalPro",
    metrics: {
      totalLeaves: 5,
      totalAbsent: 2,
      totalNOCs: 3,
      pendingNOCs: 1,
      activeDays: 150,
      lastActive: "2024-02-19",
      totalGamingHours: 90,
    },
    contact: {
      email: "tactical@example.com",
      discordId: "Tactical#5678",
      status: "Active",
    },
  },
];

const NOC_LIMIT_PER_YEAR = 4;
const MINIMUM_ACTIVE_DAYS = 120;

const PlayerManagement = () => {
  const validateNOCRequest = (player: typeof mockPlayers[0]) => {
    return player.metrics.totalNOCs < NOC_LIMIT_PER_YEAR;
  };

  const getActivityStatus = (activeDays: number) => {
    if (activeDays >= MINIMUM_ACTIVE_DAYS) {
      return "Good Standing";
    }
    return "Needs Improvement";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Player Metrics</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> View Reports
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-black text-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-900">
                <TableHead className="text-white">Total Leaves</TableHead>
                <TableHead className="text-white">Total Absent</TableHead>
                <TableHead className="text-white">Total NOCs</TableHead>
                <TableHead className="text-white">Pending NOCs</TableHead>
                <TableHead className="text-white">Active Days</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlayers.map((player) => (
                <TableRow 
                  key={player.id} 
                  className="hover:bg-gray-900 border-t border-gray-700"
                >
                  <TableCell className="text-white font-medium">
                    {player.metrics.totalLeaves}
                  </TableCell>
                  <TableCell className="text-white">
                    {player.metrics.totalAbsent}
                  </TableCell>
                  <TableCell className="text-white">
                    {player.metrics.totalNOCs}
                  </TableCell>
                  <TableCell className="text-white">
                    {player.metrics.pendingNOCs}
                  </TableCell>
                  <TableCell className="text-white">
                    {player.metrics.activeDays}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        ${getActivityStatus(player.metrics.activeDays) === "Good Standing" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {getActivityStatus(player.metrics.activeDays)}
                    </span>
                    {!validateNOCRequest(player) && (
                      <span className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                        NOC Limit Reached
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayerManagement;