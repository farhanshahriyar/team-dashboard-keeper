import { DashboardLayout } from "@/components/DashboardLayout";
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

const mockPlayers = [
  {
    id: 1,
    name: "John Doe",
    mobile: "+1234567890",
    ign: "ProGamer123",
    role: "Duelist",
    metrics: {
      totalLeaves: 5,
      totalAbsent: 2,
      lateArrivals: 3,
      totalNOCs: 8,
      pendingNOCs: 1,
      approvedNOCs: 7,
      activeDays: 45,
      lastActive: "2024-02-20",
      totalGamingHours: 120,
    },
    contact: {
      email: "john.doe@example.com",
      discordId: "ProGamer#1234",
      status: "Active",
    },
  },
  // Add more mock players here if needed
];

const PlayerManagement = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Player Management</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> View Reports
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>IGN</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total NOCs</TableHead>
                <TableHead>Active Days</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.ign}</TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell>{player.mobile}</TableCell>
                  <TableCell>{player.contact.discordId}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                      {player.contact.status}
                    </span>
                  </TableCell>
                  <TableCell>{player.metrics.totalNOCs}</TableCell>
                  <TableCell>{player.metrics.activeDays}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
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