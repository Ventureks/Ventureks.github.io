import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    recaptchaToken: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.recaptchaToken) {
        throw new Error("Proszę potwierdzić, że nie jesteś robotem");
      }

      await login(formData.username, formData.password, formData.recaptchaToken);
      setLocation("/dashboard");
    } catch (error) {
      // Silent error handling - no red toast messages
      console.log("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-96 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System CRM</h2>
          <p className="text-gray-600 dark:text-gray-300">Zaloguj się do systemu</p>
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
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <Label className="block mb-3">Weryfikacja Google</Label>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={(token) => setFormData(prev => ({ ...prev, recaptchaToken: token || "" }))}
                  onExpired={() => setFormData(prev => ({ ...prev, recaptchaToken: "" }))}
                  theme="light"
                  data-testid="recaptcha"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Demo konta:</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Admin: admin / admin123</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">User: user / user123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
