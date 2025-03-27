import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageSquare,
  Plus,
  UserRound,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

// Activity item types
type ActivityType =
  | "task_created"
  | "task_completed"
  | "comment_added"
  | "member_joined"
  | "due_date_updated";

// Activity item interface
interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  entityId: string; // Task ID or comment ID
  entityTitle?: string; // Task title
  workspaceId?: string;
  workspaceName?: string;
  timestamp: string;
  meta?: {
    commentPreview?: string;
    newDueDate?: string;
    previousDueDate?: string;
  }; // Additional contextual data
}

// Mock data - in a real app, this would come from an API
const mockActivityData: ActivityItem[] = [
  {
    id: "1",
    type: "task_completed",
    user: {
      id: "user1",
      name: "Alex Chen",
    },
    entityId: "task1",
    entityTitle: "Finalize project proposal",
    workspaceId: "workspace1",
    workspaceName: "Marketing",
    timestamp: "2025-03-26T19:30:00Z",
  },
  {
    id: "2",
    type: "comment_added",
    user: {
      id: "user2",
      name: "Sarah Johnson",
    },
    entityId: "task2",
    entityTitle: "Website redesign kickoff",
    workspaceId: "workspace2",
    workspaceName: "Design",
    timestamp: "2025-03-26T18:45:00Z",
    meta: {
      commentPreview: "I think we should schedule the meeting for next week...",
    },
  },
  {
    id: "3",
    type: "task_created",
    user: {
      id: "user3",
      name: "Miguel Rodriguez",
    },
    entityId: "task3",
    entityTitle: "Q2 financial review",
    workspaceId: "workspace3",
    workspaceName: "Finance",
    timestamp: "2025-03-26T17:15:00Z",
  },
  {
    id: "4",
    type: "member_joined",
    user: {
      id: "user4",
      name: "Priya Sharma",
    },
    entityId: "workspace2",
    workspaceId: "workspace2",
    workspaceName: "Design",
    timestamp: "2025-03-26T15:20:00Z",
  },
  {
    id: "5",
    type: "due_date_updated",
    user: {
      id: "user1",
      name: "Alex Chen",
    },
    entityId: "task4",
    entityTitle: "Client presentation",
    workspaceId: "workspace1",
    workspaceName: "Marketing",
    timestamp: "2025-03-26T14:10:00Z",
    meta: {
      newDueDate: "2025-04-02T14:00:00Z",
      previousDueDate: "2025-03-30T14:00:00Z",
    },
  },
];

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities(mockActivityData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-lg p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-card rounded-lg p-8">
        <p className="text-muted-foreground text-center">
          No recent activity to show
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg">
      <div className="divide-y">
        {activities.map((activity, index) => (
          <ActivityEntry key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </div>
  );
};

interface ActivityEntryProps {
  activity: ActivityItem;
  index: number;
}

const ActivityEntry = ({ activity, index }: ActivityEntryProps) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "comment_added":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "task_created":
        return <Plus className="h-5 w-5 text-indigo-500" />;
      case "member_joined":
        return <UserRound className="h-5 w-5 text-amber-500" />;
      case "due_date_updated":
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    const { type, user, entityTitle, workspaceName } = activity;

    switch (type) {
      case "task_completed":
        return (
          <>
            <span className="font-medium">{user.name}</span> completed task{" "}
            <span className="font-medium">{entityTitle}</span>
            {workspaceName && (
              <>
                {" "}
                in <span className="font-medium">{workspaceName}</span>
              </>
            )}
          </>
        );
      case "comment_added":
        return (
          <>
            <span className="font-medium">{user.name}</span> commented on{" "}
            <span className="font-medium">{entityTitle}</span>
            {workspaceName && (
              <>
                {" "}
                in <span className="font-medium">{workspaceName}</span>
              </>
            )}
          </>
        );
      case "task_created":
        return (
          <>
            <span className="font-medium">{user.name}</span> created{" "}
            <span className="font-medium">{entityTitle}</span>
            {workspaceName && (
              <>
                {" "}
                in <span className="font-medium">{workspaceName}</span>
              </>
            )}
          </>
        );
      case "member_joined":
        return (
          <>
            <span className="font-medium">{user.name}</span> joined workspace{" "}
            <span className="font-medium">{workspaceName}</span>
          </>
        );
      case "due_date_updated":
        return (
          <>
            <span className="font-medium">{user.name}</span> updated due date
            for <span className="font-medium">{entityTitle}</span>
            {workspaceName && (
              <>
                {" "}
                in <span className="font-medium">{workspaceName}</span>
              </>
            )}
          </>
        );
      default:
        return <span>Unknown activity</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-start gap-3 p-4"
    >
      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>

      <div className="min-w-0 flex-1">
        <p className="text-sm">{getActivityMessage(activity)}</p>

        {activity.type === "comment_added" && activity.meta?.commentPreview && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            "{activity.meta.commentPreview}"
          </p>
        )}

        <span className="text-xs text-muted-foreground block mt-1">
          {format(new Date(activity.timestamp), "MMM d, h:mm a")}
        </span>
      </div>
    </motion.div>
  );
};

export default ActivityFeed;
