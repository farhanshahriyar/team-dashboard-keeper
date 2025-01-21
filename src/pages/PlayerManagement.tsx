import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, FileText, Trash } from "lucide-react";

const mockPlayer = {
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
};

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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Player Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Player Name</p>
                  <p className="font-medium">{mockPlayer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium">{mockPlayer.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IGN</p>
                  <p className="font-medium">{mockPlayer.ign}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{mockPlayer.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{mockPlayer.contact.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discord ID</p>
                  <p className="font-medium">{mockPlayer.contact.discordId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{mockPlayer.contact.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leaves</p>
                  <p className="font-medium">{mockPlayer.metrics.totalLeaves}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Absent</p>
                  <p className="font-medium">{mockPlayer.metrics.totalAbsent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Late Arrivals</p>
                  <p className="font-medium">{mockPlayer.metrics.lateArrivals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NOC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total NOCs</p>
                  <p className="font-medium">{mockPlayer.metrics.totalNOCs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending NOCs</p>
                  <p className="font-medium">{mockPlayer.metrics.pendingNOCs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved NOCs</p>
                  <p className="font-medium">{mockPlayer.metrics.approvedNOCs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Days</p>
                  <p className="font-medium">{mockPlayer.metrics.activeDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">{mockPlayer.metrics.lastActive}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gaming Hours</p>
                  <p className="font-medium">
                    {mockPlayer.metrics.totalGamingHours}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" /> Remove Player
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayerManagement;