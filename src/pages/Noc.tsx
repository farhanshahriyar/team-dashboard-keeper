import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/DashboardLayout";

const nocData = [
  {
    id: 1,
    playerName: "John Doe",
    type: "Leave",
    startDate: "2024-02-20",
    endDate: "2024-02-25",
    status: "Approved",
    reason: "Family vacation",
  },
  // Add more sample data as needed
];

export default function Noc() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NOC Management</h1>
          <p className="text-gray-500 mt-2">
            Track leaves, NOCs, and absences
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nocData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.playerName}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.startDate}</TableCell>
                  <TableCell>{record.endDate}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>{record.reason}</TableCell>
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