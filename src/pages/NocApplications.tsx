import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function NocApplications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dummy data for UI demonstration
  const applications = [
    {
      id: 1,
      playerName: "John Doe",
      type: "noc",
      discordId: "john#1234",
      application: "Requesting NOC for tournament participation",
      uploadTime: new Date(),
    },
    {
      id: 2,
      playerName: "Jane Smith",
      type: "leave",
      discordId: "jane#5678",
      application: "Taking a break for exams",
      uploadTime: new Date(),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NOC Applications</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New NOC Application</DialogTitle>
              <DialogDescription>
                Create a new NOC application entry
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="playerName">Player Name / Real Name</Label>
                <Input id="playerName" placeholder="Enter player name" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noc">NOC</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discordId">Discord ID</Label>
                <Input id="discordId" placeholder="Enter Discord ID" />
              </div>
              <div>
                <Label htmlFor="file">Upload File</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Upload a file or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById('file')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discord ID</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Upload Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.playerName}</TableCell>
                <TableCell className="capitalize">{app.type}</TableCell>
                <TableCell>{app.discordId}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={app.application}>
                    {app.application}
                  </div>
                </TableCell>
                <TableCell>{format(app.uploadTime, 'PP')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}