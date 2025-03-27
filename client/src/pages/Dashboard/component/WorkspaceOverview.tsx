import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, Users, Home, FolderIcon } from "lucide-react";
import Progress from "../../../components/ui/progress";
import { Card, CardContent } from "../../../components/ui/card";

// Updated interface to match actual API response
interface Workspace {
  _id: string;
  id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isPersonal: boolean;
  ownerId: string;
  role: string;
  isArchived: boolean;
  settings: {
    defaultView: string;
    taskSort: string;
    taskSortDirection: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceOverviewProps {
  workspaces: Workspace[];
}

const WorkspaceOverview = ({ workspaces }: WorkspaceOverviewProps) => {
  // Show at most 5 workspaces
  const displayedWorkspaces = workspaces.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayedWorkspaces.map((workspace, index) => (
        <WorkspaceCard
          key={workspace._id}
          workspace={workspace}
          index={index}
        />
      ))}

      {workspaces.length > 5 && (
        <Link
          to="/workspaces"
          className="block text-center text-sm text-indigo-600 hover:underline mt-2"
        >
          View all {workspaces.length} workspaces
        </Link>
      )}
    </div>
  );
};

interface WorkspaceCardProps {
  workspace: Workspace;
  index: number;
}

const WorkspaceCard = ({ workspace, index }: WorkspaceCardProps) => {
  // Placeholder task count data (can be updated when available)

  // Calculate completion percentage

  // Function to render the correct icon based on the icon string
  const renderIcon = () => {
    if (workspace.icon === "home") return <Home size={20} />;
    if (workspace.icon === "folder") return <FolderIcon size={20} />;
    return <Briefcase size={20} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/workspaces/${workspace._id}`}>
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: workspace.color || "#6366F1" }}
              >
                {renderIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{workspace.name}</h3>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                  <span className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {workspace.isPersonal ? "1" : "1+"}{" "}
                    {/* Placeholder for member count */}
                  </span>
                  <span>{workspace.description}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {workspace.role === "owner" ? "Owner" : "Member"}
                </span>
                <span className="font-medium">
                  {workspace.isPersonal ? "Personal" : "Shared"} Workspace
                </span>
              </div>
              <Progress
                value={workspace.isPersonal ? 100 : 60} // Visual indicator only
                color={workspace.isPersonal ? "bg-indigo-600" : "bg-blue-500"}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default WorkspaceOverview;
