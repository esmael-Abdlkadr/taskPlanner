import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  MoreVertical,
  Folder,
  CheckSquare,
  Users,
  Archive,
  Edit,
  Briefcase,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useWorkspaces,
  useArchiveWorkspace,
  useRestoreWorkspace,
} from "../../hooks/useWorkspace";
import Button from "../../components/ui/button";
import { CreateWorkspaceDialog } from "../../features/workspace/component/CreateWorkspaceDialog";
import EmptyState from "../../components/ui/EmptyState";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { DeleteConfirmDialog } from "../../components/ui/DeleteConfirmDialog";
import { Dropdown } from "../../components/ui/dropdown";
import Input from "../../components/ui/input";
import Select from "../../components/ui/select";
import { WorkspaceBasic } from "../../types/auth.type";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const WorkspacesList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workspaceToArchive, setWorkspaceToArchive] = useState<string | null>(
    null
  );
  const [workspaceToRestore, setWorkspaceToRestore] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  // Use the status parameter to get active or archived workspaces from the API
  const { data: workspaces, isLoading } = useWorkspaces({ 
    status: showArchived ? 'archived' : 'active' 
  });
  
  const archiveWorkspaceMutation = useArchiveWorkspace();
  const restoreWorkspaceMutation = useRestoreWorkspace();
  const { setActiveWorkspace } = useWorkspaceStore();

  // Filter workspaces based on search query only (archive filtering now happens on server)
  const filteredWorkspaces = workspaces?.filter((workspace) => {
    return !searchQuery ||
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workspace.description &&
        workspace.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
  });

  const handleOpenWorkspace = (workspaceId: string, workspace:WorkspaceBasic) => {
    setActiveWorkspace(workspace);
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleArchiveConfirm = async () => {
    if (!workspaceToArchive) return;

    try {
      await archiveWorkspaceMutation.mutateAsync(workspaceToArchive);
      setWorkspaceToArchive(null);
    } catch (error) {
      console.error("Error archiving workspace:", error);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!workspaceToRestore) return;

    try {
      await restoreWorkspaceMutation.mutateAsync(workspaceToRestore);
      setWorkspaceToRestore(null);
    } catch (error) {
      console.error("Error restoring workspace:", error);
    }
  };

  const handleEditWorkspace = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}/settings`);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {showArchived ? "Archived Workspaces" : "Workspaces"}
        </h1>
        <Button
          onClick={() => setShowCreateDialog(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Workspace
        </Button>
      </div>

      {/* Search and filter options */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          options={[
            { value: "active", label: "Active Workspaces" },
            { value: "archived", label: "Archived Workspaces" },
          ]}
          value={showArchived ? "archived" : "active"}
          onChange={(value) => setShowArchived(value === "archived")}
          placeholder="Filter by status"
          className="w-auto"
        />
      </div>

      {filteredWorkspaces && filteredWorkspaces.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredWorkspaces.map((workspace) => (
            <motion.div key={workspace._id} variants={itemVariants}>
              <div
                className={`
                bg-white dark:bg-gray-800 rounded-lg border shadow-sm h-full 
                hover:border-primary/50 transition-colors cursor-pointer group
                ${
                  workspace.isArchived
                    ? "border-gray-300 dark:border-gray-600"
                    : "border-gray-200 dark:border-gray-700"
                }
              `}
              >
                <div className="p-4 flex justify-between items-start border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-md flex items-center justify-center ${
                        workspace.isPersonal ? "bg-blue-500" : ""
                      } ${workspace.isArchived ? "opacity-70" : ""}`}
                      style={{
                        backgroundColor: workspace.isPersonal
                          ? undefined
                          : workspace.color || "#6366F1",
                      }}
                    >
                      {workspace.isPersonal ? (
                        <Briefcase className="h-5 w-5 text-white" />
                      ) : (
                        <Folder className="h-5 w-5 text-white" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      {workspace.isPersonal && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Personal
                        </span>
                      )}

                      {workspace.role && workspace.role !== "owner" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {workspace.role}
                        </span>
                      )}

                      {workspace.isArchived && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          <Archive className="h-3 w-3 mr-1" /> Archived
                        </span>
                      )}
                    </div>
                  </div>

                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                    items={[
                      // For archived workspaces
                      ...(workspace.isArchived
                        ? [
                            {
                              label: "Restore Workspace",
                              icon: <RefreshCw className="mr-2 h-4 w-4" />,
                              onClick: () =>
                                setWorkspaceToRestore(workspace._id),
                            },
                          ]
                        : [
                            // For active workspaces
                            {
                              label: "View Tasks",
                              icon: <CheckSquare className="mr-2 h-4 w-4" />,
                              onClick: () =>
                                handleOpenWorkspace(workspace._id, workspace),
                            },
                            {
                              label: "Edit Details",
                              icon: <Edit className="mr-2 h-4 w-4" />,
                              onClick: () => handleEditWorkspace(workspace._id),
                            },
                            {
                              label: "Manage Members",
                              icon: <Users className="mr-2 h-4 w-4" />,
                              onClick: () =>
                                navigate(
                                  `/workspaces/${workspace._id}/settings?tab=members`
                                ),
                            },
                            // Only show archive for non-personal workspaces and if user is owner
                            ...(!workspace.isPersonal &&
                            workspace.role === "owner"
                              ? [
                                  {
                                    label: "Archive Workspace",
                                    icon: <Archive className="mr-2 h-4 w-4" />,
                                    onClick: () =>
                                      setWorkspaceToArchive(workspace._id),
                                    className:
                                      "text-amber-500 hover:text-amber-600",
                                  },
                                ]
                              : []),
                          ]),
                    ]}
                  />
                </div>

                <div
                  className={`p-4 ${workspace.isArchived ? "opacity-80" : ""}`}
                  onClick={() => {
                    if (!workspace.isArchived) {
                      handleOpenWorkspace(workspace._id, workspace);
                    }
                  }}
                >
                  <h3
                    className={`
                    text-xl font-medium mb-2 
                    ${
                      workspace.isArchived
                        ? "text-gray-500"
                        : "group-hover:text-primary"
                    }
                    transition-colors
                  `}
                  >
                    {workspace.name}
                  </h3>

                  {workspace.description && (
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                      {workspace.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tasks
                      </p>
                      <p className="text-xl font-semibold">
                        {workspace.stats?.totalTasks || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Members
                      </p>
                      <p className="text-xl font-semibold">
                        {workspace.stats?.memberCount || 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 mr-1" />
                      <span>
                        {workspace.stats?.completedTasks || 0} completed
                      </span>
                    </div>

                    <div className="flex items-center">
                      {workspace.updatedAt && (
                        <span>
                          Updated{" "}
                          {new Date(workspace.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title={showArchived ? "No archived workspaces" : "No workspaces yet"}
          description={
            showArchived
              ? "You don't have any archived workspaces"
              : "Create your first workspace to start organizing your tasks"
          }
          icon={<Folder className="h-12 w-12 text-gray-400" />}
          action={
            showArchived ? (
              <Button
                onClick={() => setShowArchived(false)}
                leftIcon={<CheckSquare className="w-4 h-4" />}
              >
                View Active Workspaces
              </Button>
            ) : (
              <Button
                onClick={() => setShowCreateDialog(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Workspace
              </Button>
            )
          }
        />
      )}

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Archive Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!workspaceToArchive}
        onClose={() => setWorkspaceToArchive(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive workspace"
        message="Are you sure you want to archive this workspace? It will be hidden from view but you can restore it later."
        isLoading={archiveWorkspaceMutation.isPending}
        confirmText="Archive"
      />

      {/* Restore Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!workspaceToRestore}
        onClose={() => setWorkspaceToRestore(null)}
        onConfirm={handleRestoreConfirm}
        title="Restore workspace"
        message="Do you want to restore this workspace? It will become active again and appear in your workspace list."
        isLoading={restoreWorkspaceMutation.isPending}
        confirmText="Restore"
      />
    </div>
  );
};

export default WorkspacesList;