import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NocRecord } from "@/types/noc";
import { FileUpload } from "./FileUpload";
import { UploadedFiles } from "./UploadedFiles";

interface NocFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  initialData?: NocRecord | null;
}

export function NocForm({ onSubmit, initialData }: NocFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="player_name">Player Name</Label>
        <Input 
          id="player_name" 
          name="player_name" 
          defaultValue={initialData?.player_name} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          defaultValue={initialData?.email}
          required 
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={initialData?.type || 'noc'}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="noc">
              <span className="flex items-center">
                <Badge variant="secondary" className="bg-red-500 text-white mr-2">NOC</Badge>
                NOC
              </span>
            </SelectItem>
            <SelectItem value="leave">
              <span className="flex items-center">
                <Badge variant="secondary" className="bg-blue-500 text-white mr-2">Leave</Badge>
                Leave
              </span>
            </SelectItem>
            <SelectItem value="absent">
              <span className="flex items-center">
                <Badge variant="secondary" className="bg-red-300 text-white mr-2">Absent</Badge>
                Absent
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input 
          id="start_date" 
          name="start_date" 
          type="date" 
          defaultValue={initialData?.start_date}
          required 
        />
      </div>
      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input 
          id="end_date" 
          name="end_date" 
          type="date" 
          defaultValue={initialData?.end_date}
          required 
        />
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input 
          id="reason" 
          name="reason" 
          defaultValue={initialData?.reason}
          required 
        />
      </div>
      {initialData && (
        <>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={initialData.status || 'pending'}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <span className="flex items-center">
                    <Badge variant="secondary" className="bg-yellow-500 text-white mr-2">Pending</Badge>
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value="rejected">
                  <span className="flex items-center">
                    <Badge variant="secondary" className="bg-red-500 text-white mr-2">Rejected</Badge>
                    Rejected
                  </span>
                </SelectItem>
                <SelectItem value="under review">
                  <span className="flex items-center">
                    <Badge variant="secondary" className="bg-blue-500 text-white mr-2">Under Review</Badge>
                    Under Review
                  </span>
                </SelectItem>
                <SelectItem value="accepted">
                  <span className="flex items-center">
                    <Badge variant="secondary" className="bg-green-500 text-white mr-2">Accepted</Badge>
                    Accepted
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Application Files</Label>
            <FileUpload nocId={initialData.id} />
            <UploadedFiles nocId={initialData.id} />
          </div>
        </>
      )}
      <Button type="submit" className="w-full">
        {initialData ? 'Update NOC Record' : 'Create NOC Record'}
      </Button>
    </form>
  );
}