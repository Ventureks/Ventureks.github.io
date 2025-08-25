import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Edit, Trash2, Calendar, Search, Filter, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { Task } from "@shared/schema";
import "react-day-picker/dist/style.css";

export default function Tasks() {
  const [newTask, setNewTask] = useState({
    title: "",
    date: "",
    time: "",
    priority: "medium",
    status: "pending"
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priority: [] as string[],
    status: [] as string[],
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined
    }
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filters.priority.length === 0 || 
      filters.priority.includes(task.priority);

    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(task.status);

    const taskDate = new Date(task.date);
    const matchesDateRange = 
      (!filters.dateRange.from || taskDate >= filters.dateRange.from) &&
      (!filters.dateRange.to || taskDate <= filters.dateRange.to);

    return matchesSearch && matchesPriority && matchesStatus && matchesDateRange;
  }) || [];

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof newTask) => {
      await apiRequest("POST", "/api/tasks", { ...data, userId: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({ title: "", date: "", time: "", priority: "medium", status: "pending" });
      toast({
        title: "Sukces",
        description: "Zadanie zostało dodane",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się dodać zadania",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      await apiRequest("PUT", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Sukces",
        description: "Zadanie zostało usunięte",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const togglePriorityFilter = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: [],
      status: [],
      dateRange: {
        from: undefined,
        to: undefined
      }
    });
    setSearchTerm("");
  };

  const uniquePriorities = Array.from(new Set(tasks?.map(t => t.priority) || []));
  const uniqueStatuses = Array.from(new Set(tasks?.map(t => t.status) || []));

  const activeFiltersCount = filters.priority.length + filters.status.length + 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) + (searchTerm ? 1 : 0);

  const toggleTaskComplete = (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  const handleDelete = (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć to zadanie?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Wysoki";
      case "medium":
        return "Średni";
      case "low":
        return "Niski";
      default:
        return priority;
    }
  };

  const getTasksForDate = (date: Date): Task[] => {
    if (!tasks) return [];
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return tasks.filter(task => task.date === dateString);
  };

  const getDatesWithTasks = (): Date[] => {
    if (!tasks) return [];
    return tasks
      .map(task => {
        // Parse date string as local date to avoid timezone issues
        const [year, month, day] = task.date.split('-').map(Number);
        return new Date(year, month - 1, day);
      })
      .filter((date, index, array) => 
        array.findIndex(d => d.toDateString() === date.toDateString()) === index
      );
  };

  const getSelectedDateTasks = (): Task[] => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  if (isLoading) {
    return (
      <MainLayout title="Planer zadań">
        <div>Ładowanie...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Planer zadań">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Task Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dodaj nowe zadanie</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Tytuł zadania</Label>
                  <Input
                    id="title"
                    placeholder="Wprowadź tytuł zadania"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    required
                    data-testid="input-task-title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask(prev => ({ ...prev, date: e.target.value }))}
                      required
                      data-testid="input-task-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Godzina</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
                      required
                      data-testid="input-task-time"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priorytet</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger data-testid="select-task-priority">
                      <SelectValue placeholder="Wybierz priorytet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niski</SelectItem>
                      <SelectItem value="medium">Średni</SelectItem>
                      <SelectItem value="high">Wysoki</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTaskMutation.isPending}
                  data-testid="button-add-task"
                >
                  {createTaskMutation.isPending ? "Dodawanie..." : "Dodaj zadanie"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Kalendarz zadań</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasTask: getDatesWithTasks()
                  }}
                  modifiersStyles={{
                    hasTask: { 
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                  className="border rounded-lg p-2"
                  data-testid="calendar-picker"
                />
                
                {selectedDate && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">
                      Zadania na {selectedDate.toLocaleDateString('pl-PL')}:
                    </h4>
                    {getSelectedDateTasks().length > 0 ? (
                      <div className="space-y-2">
                        {getSelectedDateTasks().map((task) => (
                          <div 
                            key={task.id}
                            className="p-2 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-primary"
                            data-testid={`calendar-task-${task.id}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">{task.title}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {task.time}
                                </div>
                              </div>
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {getPriorityLabel(task.priority)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Brak zadań na ten dzień</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista zadań</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks?.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    task.status === "completed" ? "opacity-60" : ""
                  }`}
                  data-testid={`task-${task.id}`}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => toggleTaskComplete(task)}
                      className="w-5 h-5 mr-4"
                      data-testid={`checkbox-task-${task.id}`}
                    />
                    <div>
                      <div className={`font-medium text-gray-900 dark:text-white ${
                        task.status === "completed" ? "line-through" : ""
                      }`}>
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {task.date} {task.time}
                        <Badge 
                          className={`ml-4 ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`button-edit-task-${task.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-900"
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
