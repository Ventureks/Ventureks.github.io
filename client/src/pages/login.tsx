import { useState } from "react";
import { useLocation } from "wouter";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    captcha: ""
  });
  const [captchaCode] = useState(Math.floor(1000 + Math.random() * 9000).toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.captcha !== captchaCode) {
        throw new Error("Nieprawidłowy kod CAPTCHA");
      }

      await login(formData.username, formData.password, formData.captcha);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Błąd logowania",
        description: error instanceof Error ? error.message : "Wystąpił błąd",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-96 shadow-lg border border-gray-200">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">System CRM</h2>
          <p className="text-gray-600">Zaloguj się do systemu</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nazwa użytkownika</Label>
              <Input
                id="username"
                type="text"
                placeholder="Wprowadź nazwę użytkownika"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                data-testid="input-username"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź hasło"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                data-testid="input-password"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <Label htmlFor="captcha">Kod CAPTCHA</Label>
              <div className="text-center mb-3">
                <span className="text-2xl font-mono bg-white px-4 py-2 rounded border tracking-widest">
                  {captchaCode}
                </span>
              </div>
              <Input
                id="captcha"
                type="text"
                placeholder="Wpisz kod CAPTCHA"
                value={formData.captcha}
                onChange={(e) => setFormData(prev => ({ ...prev, captcha: e.target.value }))}
                required
                data-testid="input-captcha"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Demo konta:</p>
              <p className="text-sm text-blue-700">Admin: admin / admin123</p>
              <p className="text-sm text-blue-700">User: user / user123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
