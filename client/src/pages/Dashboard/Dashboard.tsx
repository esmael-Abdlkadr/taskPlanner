import { useState, useMemo, useEffect } from "react";
import { useWorkspaceTasks } from "../../hooks/useTask";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { useAuthStore } from "../../store/authStore";
import { format, addDays, compareDesc, isWithinInterval } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/ui/button";
import { motion } from "framer-motion";
import DashboardHeader from "./component/DashboardHeader";
import DueSoonTasks from "./component/DueSoonTask";
import RecentTasks from "./component/RecentTask";
import WorkspaceOverview from "./component/WorkspaceOverview";
import ActivityFeed from "./component/ActivityFeed";
import { CreateTaskDialog } from "../../features/task/components/CreateTask";

const Dashboard = () => {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const { user } = useAuthStore();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();

  console.log("workspaces", workspaces);

  // Calculate today and next 7 days for due soon tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);
  nextWeek.setHours(23, 59, 59, 999);

  // Get the personal workspace from the list if available
  const personalWorkspace = workspaces?.find((ws) => ws.isPersonal);
  const defaultWorkspaceId = personalWorkspace?._id || workspaces?.[0]?._id;



  // Fetch tasks for the first workspace - ONLY when we have a valid workspace ID
  const workspaceTasks = useWorkspaceTasks(defaultWorkspaceId || undefined);
  const workspaceData = defaultWorkspaceId ? workspaceTasks.data : null;
  const tasksLoading = defaultWorkspaceId ? workspaceTasks.isLoading : false;
  console.log("alltaks", workspaceData);
  // Extract tasks from workspace data
  const allTasks = workspaceData?.tasks || [];

  // Filter tasks for due soon (next 7 days)
  const dueSoonTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return (
        isWithinInterval(dueDate, { start: today, end: nextWeek }) &&
        task.status !== "completed"
      );
    });
  }, [allTasks, today, nextWeek]);

  // Get recent tasks (most recently updated first)
  const recentTasks = useMemo(() => {
    return [...allTasks]
      .sort((a, b) =>
        compareDesc(
          new Date(a.updatedAt || a.createdAt),
          new Date(b.updatedAt || b.createdAt)
        )
      )
      .slice(0, 5);
  }, [allTasks]);

  // Add this code near your workspace extraction to help debug
  useEffect(() => {
    console.log("Raw workspaces data:", workspaces);

    // Check if workspaces is an array
    if (Array.isArray(workspaces)) {
      console.log("Workspaces is an array with length:", workspaces.length);
      workspaces.forEach((ws, i) => {
        console.log(`Workspace ${i}:`, ws._id, ws.name);
      });
    } else {
      console.log("Workspaces is not an array:", typeof workspaces);
    }

    // Log the extracted workspaceId
    console.log("Selected workspace ID:", defaultWorkspaceId);
  }, [workspaces, defaultWorkspaceId]);

  // Calculate basic stats from available tasks
  console.log("alltask", allTasks);

  const taskStats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "completed").length;
    const inProgress = allTasks.filter(
      (t) => t.status === "in-progress"
    ).length;
    const overdue = allTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < today && t.status !== "completed";
    }).length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [allTasks, today]);

  // Welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format current date
  const formattedDate = format(new Date(), "EEEE, MMMM d, yyyy");

  // Loading state for all data
  const isLoading =
    workspacesLoading || (!defaultWorkspaceId ? false : tasksLoading);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getWelcomeMessage()}, {user?.firstName || "there"}!
          </h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>

        <Button
          onClick={() => setIsCreateTaskOpen(true)}
          className="w-full md:w-auto"
          disabled={!defaultWorkspaceId}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </motion.div>

      {/* Task Stats Overview */}
      <div className="mb-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : defaultWorkspaceId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tasks"
              value={taskStats.total}
              description="Tasks in workspace"
              icon={<CheckCircle2 className="h-8 w-8 text-blue-500" />}
            />
            <StatCard
              title="Completed"
              value={taskStats.completed}
              description={`${taskStats.completionRate}% completion rate`}
              icon={<CheckCircle2 className="h-8 w-8 text-green-500" />}
            />
            <StatCard
              title="In Progress"
              value={taskStats.inProgress}
              description="Currently working on"
              icon={<Clock className="h-8 w-8 text-amber-500" />}
            />
            <StatCard
              title="Overdue"
              value={taskStats.overdue}
              description="Past due date"
              icon={<AlertCircle className="h-8 w-8 text-red-500" />}
            />
          </div>
        ) : (
          <div className="text-center p-6 bg-card rounded-lg">
            <p>Create a workspace to start managing tasks</p>
          </div>
        )}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks Due Soon & Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardHeader
            title="Tasks Due Soon"
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            description="Upcoming deadlines"
            link={defaultWorkspaceId ? `/tasks?filter=due-soon` : "#"}
            linkText="View all"
          />

          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !defaultWorkspaceId ? (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium">No workspaces available</h3>
              <p className="text-muted-foreground">
                Create a workspace to start adding tasks
              </p>
            </div>
          ) : dueSoonTasks.length > 0 ? (
            <DueSoonTasks tasks={dueSoonTasks} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg p-8 text-center">
              <CalendarClock className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No upcoming deadlines</h3>
              <p className="text-muted-foreground">
                You're all caught up! No tasks due in the next 7 days.
              </p>
            </div>
          )}

          <DashboardHeader
            title="Recent Tasks"
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            description="Your latest tasks"
            link={defaultWorkspaceId ? `/tasks` : "#"}
            linkText="View all tasks"
          />

          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !defaultWorkspaceId ? (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium">No workspaces available</h3>
              <p className="text-muted-foreground">
                Create a workspace to start adding tasks
              </p>
            </div>
          ) : recentTasks.length > 0 ? (
            <RecentTasks tasks={recentTasks} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground">
                Create a new task to get started.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Workspaces & Activity */}
        <div className="space-y-6">
          <DashboardHeader
            title="My Workspaces"
            description="Your projects and teams"
            link="/workspaces"
            linkText="Manage workspaces"
          />

          {workspacesLoading ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            <WorkspaceOverview workspaces={workspaces} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium">No workspaces yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a workspace to organize your tasks
              </p>
              <Button variant="outline" onClick={() => {}}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </div>
          )}

          <DashboardHeader
            title="Recent Activity"
            description="Latest updates and changes"
          />
          <ActivityFeed />
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        defaultWorkspaceId={defaultWorkspaceId}
      />
    </div>
  );
};

// Simple StatCard component for the stats section
const StatCard = ({ title, value, description, icon }) => {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{value}</h3>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;
