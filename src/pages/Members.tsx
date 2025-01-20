import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/DashboardLayout";

const members = [
  {
    id: 1,
    email: "player1@example.com",
    realName: "John Doe",
    birthdate: "1995-05-15",
    phone: "+1234567890",
    ign: "ProGamer123",
    gameRole: "Duelist",
    discordId: "player1#1234",
    facebook: "john.doe",
  },
  // Add more sample data as needed
];

export default function Members() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-2">Manage your team's information</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell>{member.realName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.ign}</TableCell>
                  <TableCell>{member.gameRole}</TableCell>
                  <TableCell>{member.discordId}</TableCell>
                  <TableCell>
                    <button className="text-primary hover:text-primary/80">
                      Edit
                    </button>
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