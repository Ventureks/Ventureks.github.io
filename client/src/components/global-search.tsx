import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, Users, Calendar, FileText, Mail, HeadphonesIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
  id: string;
  type: 'contractor' | 'task' | 'offer' | 'email' | 'support';
  title: string;
  subtitle: string;
  details: string;
  status?: string;
}

interface SearchFilters {
  types: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  status: string[];
}

export function GlobalSearch({ className = "" }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['contractor', 'task', 'offer', 'email', 'support'],
    dateRange: {},
    status: []
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", searchTerm, filters],
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contractor':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'task':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'offer':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-500" />;
      case 'support':
        return <HeadphonesIcon className="w-4 h-4 text-red-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contractor':
        return 'Kontrahent';
      case 'task':
        return 'Zadanie';
      case 'offer':
        return 'Oferta';
      case 'email':
        return 'Email';
      case 'support':
        return 'Wsparcie';
      default:
        return type;
    }
  };

  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      types: ['contractor', 'task', 'offer', 'email', 'support'],
      dateRange: {},
      status: []
    });
  };

  const activeFiltersCount = 
    (5 - filters.types.length) + 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    filters.status.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            data-testid="global-search-trigger"
          >
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">Szukaj wszędzie...</span>
            <div className="ml-auto flex items-center gap-1">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Wpisz co najmniej 2 znaki..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              data-testid="global-search-input"
            />
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtry
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Typy danych</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['contractor', 'task', 'offer', 'email', 'support'].map(type => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => toggleTypeFilter(type)}
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type)}
                        {getTypeLabel(type)}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={activeFiltersCount === 0}
                    onCheckedChange={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Wyczyść filtry
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <CommandList>
            {isLoading && searchTerm.length >= 2 && (
              <div className="p-6 text-center text-sm">
                Wyszukiwanie...
              </div>
            )}
            
            {!isLoading && searchTerm.length >= 2 && searchResults.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Search className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Nie znaleziono wyników dla "{searchTerm}"
                  </p>
                </div>
              </CommandEmpty>
            )}

            {searchResults.length > 0 && (
              <CommandGroup heading={`Znaleziono ${searchResults.length} wyników`}>
                {searchResults.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    value={`${result.title} ${result.subtitle} ${result.details}`}
                    className="p-3 cursor-pointer"
                    onSelect={() => {
                      setIsOpen(false);
                      setSearchTerm("");
                      // Navigate to the result - will be implemented per module
                      console.log("Navigate to:", result);
                    }}
                    data-testid={`search-result-${result.type}-${result.id}`}
                  >
                    <Card className="w-full border-0 shadow-none">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                              {result.status && (
                                <Badge
                                  variant={result.status === 'active' || result.status === 'completed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {result.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {result.subtitle}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {result.details}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchTerm.length < 2 && (
              <div className="p-6 text-center text-sm text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p>Wpisz co najmniej 2 znaki aby rozpocząć wyszukiwanie</p>
                <p className="text-xs mt-2 text-gray-400">
                  Wyszukuj w kontrahentach, zadaniach, ofertach, emailach i zgłoszeniach
                </p>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}