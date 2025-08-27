import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobilny overlay dla sidebar */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - ukryty na mobile, wyświetlany jako drawer */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : 'relative'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <Sidebar onMobileClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Główna zawartość */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />
        <main className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
