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
import { useToast } from "@/components/ui/use-toast";

const mockPlayers = [
  {
    id: 1,
    mobile: "+1234567890",
    ign: "ProGamer123",
    metrics: {
      totalLeaves: 5,
      totalAbsent: 2,
      lateArrivals: 3,
      totalNOCs: 3, // Max 4 per year
      pendingNOCs: 1,
      approvedNOCs: 2,
      activeDays: 145, // Minimum required: 120 days
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
    mobile: "+9876543210",
    ign: "NightHawk",
    metrics: {
      totalLeaves: 8,
      totalAbsent: 4,
      lateArrivals: 5,
      totalNOCs: 4, // At max limit
      pendingNOCs: 0,
      approvedNOCs: 4,
      activeDays: 90, // Below minimum requirement
      lastActive: "2024-02-19",
      totalGamingHours: 80,
    },
    contact: {
      email: "nighthawk@example.com",
      discordId: "NightHawk#5678",
      status: "Warning",
    },
  },
];

const PlayerManagement = () => {
  const { toast } = useToast();

  const getStatusColor = (player: typeof mockPlayers[0]) => {
    if (player.metrics.totalNOCs >= 4) {
      return "bg-red-100 text-red-700";
    }
    if (player.metrics.activeDays < 120) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-green-100 text-green-700";
  };

  const getStatusText = (player: typeof mockPlayers[0]) => {
    if (player.metrics.totalNOCs >= 4) {
      return "NOC Limit Reached";
    }
    if (player.metrics.activeDays < 120) {
      return "Low Activity";
    }
    return "Active";
  };

  const handleNOCRequest = (player: typeof mockPlayers[0]) => {
    if (player.metrics.totalNOCs >= 4) {
      toast({
        title: "NOC Request Failed",
        description: "Player has reached the maximum limit of 4 NOCs per year",
        variant: "destructive",
      });
    } else {
      toast({
        title: "NOC Request Submitted",
        description: "The NOC request has been submitted for approval",
      });
    }
  };

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
                <TableHead>IGN</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Total Leaves</TableHead>
                <TableHead>Total Absent</TableHead>
                <TableHead>Total NOCs</TableHead>
                <TableHead>Pending NOCs</TableHead>
                <TableHead>Active Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.ign}</TableCell>
                  <TableCell>{player.mobile}</TableCell>
                  <TableCell>{player.contact.discordId}</TableCell>
                  <TableCell>{player.metrics.totalLeaves}</TableCell>
                  <TableCell>{player.metrics.totalAbsent}</TableCell>
                  <TableCell>{player.metrics.totalNOCs}</TableCell>
                  <TableCell>{player.metrics.pendingNOCs}</TableCell>
                  <TableCell>{player.metrics.activeDays}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        player
                      )}`}
                    >
                      {getStatusText(player)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleNOCRequest(player)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
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