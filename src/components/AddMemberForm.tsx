
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";
import { useEffect } from "react";

type Member = Database['public']['Tables']['team_members']['Row'];
type NewMember = Omit<Member, 'id' | 'created_at' | 'user_id'>;

const formSchema = z.object({
  email: z.string().email(),
  real_name: z.string().min(2),
  birthdate: z.string(),
  phone: z.string(),
  ign: z.string().min(2),
  game_role: z.enum(["duelist", "sentinel", "initiator", "controller"]),
  discord_id: z.string(),
  facebook: z.string().url(),
  picture: z.string(),
});

interface AddMemberFormProps {
  onSubmit: (data: NewMember) => Promise<void>;
  initialData?: Member;
}

export function AddMemberForm({ onSubmit, initialData }: AddMemberFormProps) {
  const form = useForm<NewMember>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      real_name: "",
      birthdate: "",
      phone: "",
      ign: "",
      game_role: "duelist",
      discord_id: "",
      facebook: "",
      picture: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        real_name: initialData.real_name,
        birthdate: initialData.birthdate,
        phone: initialData.phone,
        ign: initialData.ign,
        game_role: initialData.game_role,
        discord_id: initialData.discord_id,
        facebook: initialData.facebook,
        picture: initialData.picture || "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: NewMember) => {
    await onSubmit(data);
    if (!initialData) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Email Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Email" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="real_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Real Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Real Name" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Birthdate</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Phone Number" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ign"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">IGN</FormLabel>
              <FormControl>
                <Input 
                  placeholder="In-Game Name" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="game_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Game Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background/50 border-white/10 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="duelist">Duelist</SelectItem>
                  <SelectItem value="sentinel">Sentinel</SelectItem>
                  <SelectItem value="initiator">Initiator</SelectItem>
                  <SelectItem value="controller">Controller</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discord_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Discord ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Discord ID" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Facebook Link</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Facebook Profile URL" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Picture URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Picture URL" 
                  {...field} 
                  className="bg-background/50 border-white/10 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#DC2626]/90">
          {initialData ? 'Update Member' : 'Add Member'}
        </Button>
      </form>
    </Form>
  );
}
