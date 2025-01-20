import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AddMemberForm } from "@/components/AddMemberForm";
import { Edit, Download, Trash2 } from "lucide-react";
import { useState } from "react";

type Member = {
  id: number;
  email: string;
  realName: string;
  birthdate: string;
  phone: string;
  ign: string;
  gameRole: "duelist" | "sentinel" | "initiator" | "controller";
  picture: string;
  discordId: string;
  facebook: string;
};

const initialMembers: Member[] = [
  {
    id: 1,
    email: "player1@example.com",
    realName: "John Doe",
    birthdate: "1995-05-15",
    phone: "+1234567890",
    ign: "ProGamer123",
    gameRole: "duelist",
    picture: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    discordId: "player1#1234",
    facebook: "https://facebook.com/john.doe",
  },
];

export default function Members() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddMember = (data: Omit<Member, "id">) => {
    const newMember = {
      ...data,
      id: members.length + 1,
    };
    setMembers([...members, newMember]);
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const exportToCSV = () => {
    // Convert members data to CSV format
    const headers = [
      "Email",
      "Real Name",
      "Birthdate",
      "Phone",
      "IGN",
      "Game Role",
      "Discord ID",
      "Facebook"
    ];

    const csvData = members.map(member => [
      member.email,
      member.realName,
      member.birthdate,
      member.phone,
      member.ign,
      member.gameRole,
      member.discordId,
      member.facebook
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "team_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-500 mt-2">Manage your team's information</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Team Member</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                </DialogHeader>
                <AddMemberForm onSubmit={handleAddMember} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Picture</TableHead>
                <TableHead>Real Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>IGN</TableHead>
                <TableHead>Game Role</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <img
                      src={member.picture}
                      alt={member.realName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{member.realName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.ign}</TableCell>
                  <TableCell className="capitalize">{member.gameRole}</TableCell>
                  <TableCell>{member.discordId}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(member.id)}
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
    </DashboardLayout>
  );
}