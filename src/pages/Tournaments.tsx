import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tournaments')
        .insert({
          tournament_name: formData.get('tournament_name'),
          start_time: formData.get('start_time'),
          location: formData.get('location'),
          hoster: formData.get('hoster'),
          roster: formData.get('roster'),
          discord_link: formData.get('discord_link'),
          tournament_link: formData.get('tournament_link'),
          price_pool: formData.get('price_pool') ? Number(formData.get('price_pool')) : null,
          entry_fee: formData.get('entry_fee') ? Number(formData.get('entry_fee')) : null,
          user_id: user.id,
        });

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
                <Textarea id="roster" name="roster" required />
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

      <div className="space-y-4">
        {tournaments?.map((tournament) => (
          <Card key={tournament.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl">{tournament.tournament_name}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {format(new Date(tournament.start_time), 'PPp')}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {tournament.location}
                  </span>
                  <span className="flex items-center">
                    <Trophy className="mr-1 h-4 w-4" />
                    {tournament.price_pool ? `$${tournament.price_pool}` : 'No prize pool'}
                  </span>
                </div>
              </div>
              <Badge variant={tournament.status === 'pending' ? 'secondary' : 'default'}>
                {tournament.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Roster</h4>
                  <p className="text-sm text-muted-foreground">{tournament.roster}</p>
                </div>
                <div className="flex space-x-4">
                  {tournament.discord_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={tournament.discord_link} target="_blank" rel="noopener noreferrer">
                        Discord
                      </a>
                    </Button>
                  )}
                  {tournament.tournament_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={tournament.tournament_link} target="_blank" rel="noopener noreferrer">
                        Tournament Page
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}