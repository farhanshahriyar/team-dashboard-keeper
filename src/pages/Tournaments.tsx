import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Tournament = {
  id: string;
  tournament_name: string;
  start_time: string;
  location: string;
  hoster: string;
  roster: string;
  discord_link?: string;
  tournament_link?: string;
  price_pool?: number;
  entry_fee?: number;
  status: string;
  created_at: string;
};

export default function Tournaments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newTeam, setNewTeam] = useState("");
  const [teams, setTeams] = useState<string[]>(["KingsRock eSports", "KingsRock Academy"]);
  const { toast } = useToast();

  const { data: tournaments, refetch } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Tournament[];
    },
  });

  const handleAddTeam = () => {
    if (newTeam.trim()) {
      setTeams([...teams, newTeam.trim()]);
      setNewTeam("");
      setIsAddingTeam(false);
      toast({
        title: "Team added",
        description: "New team has been added to the list",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tournaments')
        .insert([{
          tournament_name: formData.get('tournament_name') as string,
          start_time: formData.get('start_time') as string,
          location: formData.get('location') as string,
          hoster: formData.get('hoster') as string,
          roster: formData.get('roster') as string,
          discord_link: formData.get('discord_link') as string || null,
          tournament_link: formData.get('tournament_link') as string || null,
          price_pool: formData.get('price_pool') ? Number(formData.get('price_pool')) : null,
          entry_fee: formData.get('entry_fee') ? Number(formData.get('entry_fee')) : null,
          user_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tournament created successfully",
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Tournament</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Tournament</DialogTitle>
              <DialogDescription>
                Create a new tournament entry
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tournament_name">Tournament Name</Label>
                <Input id="tournament_name" name="tournament_name" required />
              </div>
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" name="start_time" type="datetime-local" required />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" required />
              </div>
              <div>
                <Label htmlFor="hoster">Hoster</Label>
                <Input id="hoster" name="hoster" required />
              </div>
              <div>
                <Label htmlFor="roster">Roster</Label>
                {isAddingTeam ? (
                  <div className="flex gap-2">
                    <Input
                      value={newTeam}
                      onChange={(e) => setNewTeam(e.target.value)}
                      placeholder="Enter new team name"
                    />
                    <Button type="button" onClick={handleAddTeam}>Add</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddingTeam(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select name="roster" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAddingTeam(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add another team
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="discord_link">Discord Link (Optional)</Label>
                <Input id="discord_link" name="discord_link" />
              </div>
              <div>
                <Label htmlFor="tournament_link">Tournament Link (Optional)</Label>
                <Input id="tournament_link" name="tournament_link" />
              </div>
              <div>
                <Label htmlFor="price_pool">Price Pool (Optional)</Label>
                <Input id="price_pool" name="price_pool" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="entry_fee">Entry Fee (Optional)</Label>
                <Input id="entry_fee" name="entry_fee" type="number" step="0.01" />
              </div>
              <Button type="submit" className="w-full">Create Tournament</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament Name</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Price Pool</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments?.map((tournament) => (
              <TableRow key={tournament.id}>
                <TableCell className="font-medium">{tournament.tournament_name}</TableCell>
                <TableCell>
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {format(new Date(tournament.start_time), 'PPp')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {tournament.location}
                  </span>
                </TableCell>
                <TableCell>{tournament.roster}</TableCell>
                <TableCell>
                  <span className="flex items-center">
                    <Trophy className="mr-1 h-4 w-4" />
                    {tournament.price_pool ? `$${tournament.price_pool}` : 'No prize pool'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={tournament.status === 'pending' ? 'secondary' : 'default'}>
                    {tournament.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}