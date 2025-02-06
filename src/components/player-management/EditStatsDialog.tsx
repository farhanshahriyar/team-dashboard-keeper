import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlayerStats } from "./types";

interface EditStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: PlayerStats;
  onStatsChange: (stats: PlayerStats) => void;
  onSave: () => void;
}

export const EditStatsDialog = ({
  open,
  onOpenChange,
  stats,
  onStatsChange,
  onSave,
}: EditStatsDialogProps) => {
  const handleInputChange = (field: keyof PlayerStats, value: string) => {
    onStatsChange({
      ...stats,
      [field]: parseInt(value) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Player Statistics</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="leaveDays" className="text-right">
              Leave Days
            </Label>
            <Input
              id="leaveDays"
              type="number"
              value={stats.leaveDays}
              onChange={(e) => handleInputChange('leaveDays', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="absentDays" className="text-right">
              Absent Days
            </Label>
            <Input
              id="absentDays"
              type="number"
              value={stats.absentDays}
              onChange={(e) => handleInputChange('absentDays', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nocDays" className="text-right">
              NOC Days
            </Label>
            <Input
              id="nocDays"
              type="number"
              value={stats.nocDays}
              onChange={(e) => handleInputChange('nocDays', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentMonthLeaves" className="text-right">
              Current Month Leaves
            </Label>
            <Input
              id="currentMonthLeaves"
              type="number"
              value={stats.currentMonthLeaves}
              onChange={(e) => handleInputChange('currentMonthLeaves', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentMonthAbsents" className="text-right">
              Current Month Absents
            </Label>
            <Input
              id="currentMonthAbsents"
              type="number"
              value={stats.currentMonthAbsents}
              onChange={(e) => handleInputChange('currentMonthAbsents', e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};