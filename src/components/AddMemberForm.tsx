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
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
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
              <FormLabel>Real Name</FormLabel>
              <FormControl>
                <Input placeholder="Real Name" {...field} />
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
              <FormLabel>Birthdate</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Phone Number" {...field} />
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
              <FormLabel>IGN</FormLabel>
              <FormControl>
                <Input placeholder="In-Game Name" {...field} />
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
              <FormLabel>Game Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormLabel>Discord ID</FormLabel>
              <FormControl>
                <Input placeholder="Discord ID" {...field} />
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
              <FormLabel>Facebook Link</FormLabel>
              <FormControl>
                <Input placeholder="Facebook Profile URL" {...field} />
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
              <FormLabel>Picture URL</FormLabel>
              <FormControl>
                <Input placeholder="Picture URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? 'Update Member' : 'Add Member'}
        </Button>
      </form>
    </Form>
  );
}