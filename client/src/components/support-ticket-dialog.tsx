import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSupportTicketSchema, type InsertSupportTicket } from "@shared/schema";

interface SupportTicketDialogProps {
  children: React.ReactNode;
}

export function SupportTicketDialog({ children }: SupportTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSupportTicket>({
    resolver: zodResolver(insertSupportTicketSchema),
    defaultValues: {
      user: "",
      email: "",
      issue: "",
      priority: "medium",
      status: "open",
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertSupportTicket) => {
      await apiRequest("POST", "/api/support-tickets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sukces",
        description: "Zgłoszenie zostało utworzone",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć zgłoszenia",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSupportTicket) => {
    createTicketMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nowe zgłoszenie</DialogTitle>
          <DialogDescription>
            Utwórz nowe zgłoszenie do systemu wsparcia.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Użytkownik</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Imię i nazwisko"
                      {...field}
                      data-testid="input-user"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorytet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue placeholder="Wybierz priorytet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Niski</SelectItem>
                      <SelectItem value="medium">Średni</SelectItem>
                      <SelectItem value="high">Wysoki</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis problemu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opisz szczegółowo problem..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      data-testid="textarea-issue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                data-testid="button-submit"
              >
                {createTicketMutation.isPending ? "Tworzenie..." : "Utwórz zgłoszenie"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}