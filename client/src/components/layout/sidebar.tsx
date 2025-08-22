import { useLocation } from "wouter";
import { 
  BarChart, 
  Users, 
  Calendar, 
  FileText, 
  Mail, 
  Shield, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { id: "dashboard", label: "Panel główny", icon: BarChart, path: "/dashboard" },
  { id: "contractors", label: "Kontrahenci", icon: Users, path: "/contractors" },
  { id: "tasks", label: "Planer zadań", icon: Calendar, path: "/tasks" },
  { id: "offers", label: "Oferty", icon: FileText, path: "/offers" },
  { id: "emails", label: "Wiadomości email", icon: Mail, path: "/emails" },
  { id: "support", label: "Wsparcie", icon: Shield, path: "/support" }
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">CRM System</h1>
            <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setLocation(item.path)}
                  className={`flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? "bg-primary/10 border-l-4 border-primary text-primary" : ""
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {user?.username}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-gray-500 hover:text-red-500"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
