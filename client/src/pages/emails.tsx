import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Settings, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Email } from "@shared/schema";

export default function Emails() {
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    content: "",
    status: "draft"
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: emails, isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const { data: smtpStatus } = useQuery({
    queryKey: ["/api/smtp/status"],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof newEmail) => {
      await apiRequest("POST", "/api/emails", {
        ...data,
        status: "sent",
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      setNewEmail({ to: "", subject: "", content: "", status: "draft" });
      toast({
        title: "Sukces",
        description: "Email został wysłany",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się wysłać emaila",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate(newEmail);
  };

  if (isLoading) {
    return (
      <MainLayout title="Wiadomości email">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Wysłany";
      case "failed":
        return "Błąd";
      default:
        return "Szkic";
    }
  };

  return (
    <MainLayout title="Wiadomości email">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Serwis e-mail</h2>
          <Link href="/email-settings">
            <Button variant="outline" size="sm" data-testid="button-email-settings">
              <Settings className="w-4 h-4 mr-2" />
              Ustawienia SMTP
            </Button>
          </Link>
        </div>

        {/* SMTP Status Alert */}
        {!smtpStatus?.configured && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              SMTP nie jest skonfigurowany. Wiadomości będą zapisane jako szkice.{" "}
              <Link href="/email-settings" className="underline">
                Skonfiguruj SMTP
              </Link>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Email Form */}
          <Card>
            <CardHeader>
              <CardTitle>Nowa wiadomość</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="to">Do (email)</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="adres@email.pl"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, to: e.target.value }))}
                    required
                    data-testid="input-email-to"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Temat</Label>
                  <Input
                    id="subject"
                    placeholder="Temat wiadomości"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    data-testid="input-email-subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Treść wiadomości</Label>
                  <Textarea
                    id="content"
                    placeholder="Treść wiadomości"
                    value={newEmail.content}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, content: e.target.value }))}
                    className="h-32"
                    data-testid="textarea-email-content"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className="w-full flex items-center"
                  data-testid="button-send-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendEmailMutation.isPending ? "Wysyłanie..." : "Wyślij"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Email History */}
          <Card>
            <CardHeader>
              <CardTitle>Historia wiadomości</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emails?.map((email) => (
                  <div
                    key={email.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    data-testid={`email-${email.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{email.subject}</div>
                        <div className="text-sm text-gray-600">Do: {email.to}</div>
                      </div>
                      <div className="text-sm">
                        <Badge 
                          variant={email.status === "sent" ? "default" : "secondary"}
                          className={getStatusColor(email.status)}
                        >
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(email.status)}
                            <span>{getStatusText(email.status)}</span>
                          </span>
                        </Badge>
                        <div className="text-gray-500 mt-1">
                          {email.createdAt ? new Date(email.createdAt).toLocaleDateString('pl-PL') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!emails || emails.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    Brak wiadomości email
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
