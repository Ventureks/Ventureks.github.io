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
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    login: ""
  });
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const validateForm = () => {
    const newErrors = { username: "", password: "", login: "" };
    
    if (!formData.username.trim()) {
      newErrors.username = "Nazwa użytkownika jest wymagana";
    } else if (formData.username.length < 3) {
      newErrors.username = "Nazwa użytkownika musi mieć minimum 3 znaki";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Hasło jest wymagane";
    } else if (formData.password.length < 6) {
      newErrors.password = "Hasło musi mieć minimum 6 znaków";
    }
    
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      if (!formData.recaptchaToken) {
        setErrors(prev => ({ ...prev, login: "Proszę potwierdzić, że nie jesteś robotem" }));
        return;
      }

      // Clear any previous login errors
      setErrors(prev => ({ ...prev, login: "" }));
      
      await login(formData.username, formData.password, formData.recaptchaToken);
      setLocation("/dashboard");
    } catch (error) {
      // Show login error message
      setErrors(prev => ({ 
        ...prev, 
        login: "Nieprawidłowa nazwa użytkownika lub hasło" 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Clear login error when user changes credentials
    if (errors.login && (field === "username" || field === "password")) {
      setErrors(prev => ({ ...prev, login: "" }));
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
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={errors.username ? "border-red-500 focus:border-red-500" : ""}
                data-testid="input-username"
              />
              {errors.username && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.username}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź hasło"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-red-500 focus:border-red-500" : ""}
                data-testid="input-password"
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.password}
                </p>
              )}
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
            
            {errors.login && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-sm text-red-800 dark:text-red-300 text-center">
                  {errors.login}
                </p>
              </div>
            )}
            
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
