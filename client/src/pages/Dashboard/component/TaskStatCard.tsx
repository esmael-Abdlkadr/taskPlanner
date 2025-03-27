import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { TaskStats } from "../../../types/task.types";

interface TaskStatCardsProps {
  stats: TaskStats;
}

const TaskStatCards = ({ stats }: TaskStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <StatCard
        title="To Do"
        value={stats?.todo}
        icon={<CircleDashed className="h-5 w-5 text-blue-500" />}
        color="blue"
        delay={0.1}
      />

      <StatCard
        title="In Progress"
        value={stats?.inProgress}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        color="amber"
        delay={0.2}
      />

      <StatCard
        title="Completed"
        value={stats?.done}
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        color="green"
        delay={0.3}
      />

      <StatCard
        title="Overdue"
        value={stats?.overdue}
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        color="red"
        delay={0.4}
      />

      <StatCard
        title="Total Tasks"
        value={stats?.totalTasks}
        icon={<ClipboardList className="h-5 w-5 text-indigo-500" />}
        color="indigo"
        delay={0.5}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => {
  const bgColorClass = `bg-${color}-50 dark:bg-${color}-900/20`;
  const borderColorClass = `border-${color}-100 dark:border-${color}-900/30`;
  const textColorClass = `text-${color}-700 dark:text-${color}-300`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`flex flex-col items-center justify-center p-6 rounded-lg border ${borderColorClass} ${bgColorClass}`}
    >
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className={`text-sm ${textColorClass}`}>{title}</div>
    </motion.div>
  );
};

export default TaskStatCards;
