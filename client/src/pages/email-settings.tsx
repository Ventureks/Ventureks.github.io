import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Mail, CheckCircle, XCircle, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SMTPStatus {
  configured: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  user: string | null;
}

export default function EmailSettings() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    secure: false,
    user: "",
    pass: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: smtpStatus, isLoading } = useQuery<SMTPStatus>({
    queryKey: ["/api/smtp/status"],
  });

  const configureSmtpMutation = useMutation({
    mutationFn: async (data: typeof smtpConfig) => {
      await apiRequest("POST", "/api/smtp/configure", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smtp/status"] });
      toast({
        title: "Sukces",
        description: "Konfiguracja SMTP została zapisana",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zapisać konfiguracji SMTP",
        variant: "destructive",
      });
    },
  });

  const testSmtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/smtp/test");
      return response;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Sukces",
          description: "Połączenie SMTP działa poprawnie",
        });
      } else {
        toast({
          title: "Błąd połączenia",
          description: data.error || "Test połączenia nie powiódł się",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się przetestować połączenia SMTP",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (smtpStatus && smtpStatus.configured) {
      setSmtpConfig(prev => ({
        ...prev,
        host: smtpStatus.host || "",
        port: smtpStatus.port?.toString() || "587",
        secure: smtpStatus.secure,
        user: smtpStatus.user || ""
      }));
    }
  }, [smtpStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    configureSmtpMutation.mutate(smtpConfig);
  };

  const handleTestConnection = () => {
    testSmtpMutation.mutate();
  };

  if (isLoading) {
    return (
      <MainLayout title="Ustawienia email">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Ustawienia email">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Mail className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ustawienia SMTP</h2>
        </div>
        
        {/* Status SMTP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Status konfiguracji SMTP</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={smtpStatus?.configured ? "default" : "secondary"}
                className={smtpStatus?.configured ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {smtpStatus?.configured ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Skonfigurowany
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    Nieskonfigurowany
                  </>
                )}
              </Badge>
              {smtpStatus?.configured && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testSmtpMutation.isPending}
                  data-testid="button-test-smtp"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testSmtpMutation.isPending ? "Testowanie..." : "Test połączenia"}
                </Button>
              )}
            </div>
            {smtpStatus?.configured && (
              <div className="mt-3 text-sm text-muted-foreground">
                <p><strong>Serwer:</strong> {smtpStatus.host}:{smtpStatus.port}</p>
                <p><strong>Użytkownik:</strong> {smtpStatus.user}</p>
                <p><strong>Zabezpieczenie:</strong> {smtpStatus.secure ? "TLS/SSL" : "Brak"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Konfiguracja SMTP */}
        <Card>
          <CardHeader>
            <CardTitle>Konfiguracja serwera SMTP</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Serwer SMTP</Label>
                  <Input
                    id="host"
                    placeholder="smtp.gmail.com"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                    required
                    data-testid="input-smtp-host"
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="587"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                    required
                    data-testid="input-smtp-port"
                  />
                </div>
                <div>
                  <Label htmlFor="user">Użytkownik (email)</Label>
                  <Input
                    id="user"
                    type="email"
                    placeholder="twoj@email.com"
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                    required
                    data-testid="input-smtp-user"
                  />
                </div>
                <div>
                  <Label htmlFor="pass">Hasło</Label>
                  <Input
                    id="pass"
                    type="password"
                    placeholder="••••••••"
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, pass: e.target.value }))}
                    required
                    data-testid="input-smtp-pass"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="secure"
                  checked={smtpConfig.secure}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, secure: e.target.checked }))}
                  data-testid="checkbox-smtp-secure"
                />
                <Label htmlFor="secure">Użyj TLS/SSL (zalecane dla portu 465)</Label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Popularne ustawienia SMTP:</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p><strong>Gmail:</strong> smtp.gmail.com, port 587, TLS włączony</p>
                  <p><strong>Outlook:</strong> smtp-mail.outlook.com, port 587, TLS włączony</p>
                  <p><strong>Yahoo:</strong> smtp.mail.yahoo.com, port 587, TLS włączony</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={configureSmtpMutation.isPending}
                  data-testid="button-save-smtp"
                >
                  {configureSmtpMutation.isPending ? "Zapisywanie..." : "Zapisz konfigurację"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}