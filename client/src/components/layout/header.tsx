import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { GlobalSearch } from "@/components/global-search";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ title, onMenuClick, showMenuButton }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block w-64 lg:w-96 max-w-md">
            <GlobalSearch />
          </div>
          <NotificationsDropdown />
        </div>
      </div>
    </header>
  );
}
