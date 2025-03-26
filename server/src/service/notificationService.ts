import { User } from "../models/User";
import { Task } from "../models/Task";
import { Workspace } from "../models/Workspace";
import sendEmail from "../utils/sendEmail";


class NotificationService {
  async sendMentionNotifications(
    mentionedUserIds: string[],
    comment: string,
    taskId: string,
    authorName: string
  ) {
    try {
      const task = await Task.findById(taskId).select('title workspaceId');
      if (!task) return;

      const workspace = await Workspace.findById(task.workspaceId).select('name');
      if (!workspace) return;
      const mentionedUsers = await User.find({
        _id: { $in: mentionedUserIds },
        'preferences.notifications': true
      }).select('firstName email');

      // Send email to each mentioned user
      for (const user of mentionedUsers) {
        const data = {
          user: { name: user.firstName, email: user.email },
          authorName,
          taskTitle: task.title,
          workspaceName: workspace.name,
          comment: comment.length > 200 ? comment.substring(0, 197) + '...' : comment,
          taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}`,
          currentDate: new Date().toISOString().split('T')[0]
        };

        await sendEmail({
          email: user.email,
          subject: `${authorName} mentioned you in a comment on TaskNest`,
          template: "mention",
          date: data
        });
      }
    } catch (error) {
      console.error("Error sending mention notifications:", error);
    }
  }

 
  async sendTaskAssignmentNotification(
    taskId: string,
    assigneeId: string,
    assignerName: string
  ) {
    try {
    
      const task = await Task.findById(taskId).select('title workspaceId dueDate');
      if (!task) return;


      const workspace = await Workspace.findById(task.workspaceId).select('name');
      if (!workspace) return;

      // Get the assignee
      const assignee = await User.findOne({
        _id: assigneeId,
        'preferences.notifications': true
      }).select('firstName email');

      if (!assignee) return;

      const data = {
        user: { name: assignee.firstName, email: assignee.email },
        assignerName,
        taskTitle: task.title,
        workspaceName: workspace.name,
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
        taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}`,
        currentDate: new Date().toISOString().split('T')[0]
      };

      await sendEmail({
        email: assignee.email,
        subject: `${assignerName} assigned you a task on TaskNest`,
        template: "taskAssignment",
        date: data
      });
    } catch (error) {
      console.error("Error sending task assignment notification:", error);
    }
  }


  async sendDueDateReminder(
    taskId: string,
    userId: string,
    daysRemaining: number
  ) {
    try {
      // Get the task
      const task = await Task.findById(taskId).select('title workspaceId dueDate');
      if (!task) return;

      // Get the workspace
      const workspace = await Workspace.findById(task.workspaceId).select('name');
      if (!workspace) return;

      // Get the user
      const user = await User.findOne({
        _id: userId,
        'preferences.notifications': true
      }).select('firstName email');

      if (!user) return;

      const data = {
        user: { name: user.firstName, email: user.email },
        taskTitle: task.title,
        workspaceName: workspace.name,
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
        daysRemaining,
        taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}`,
        currentDate: new Date().toISOString().split('T')[0]
      };

      await sendEmail({
        email: user.email,
        subject: `Task due soon: "${task.title}" (${daysRemaining} days remaining)`,
        template: "dueDateReminder",
        date: data
      });
    } catch (error) {
      console.error("Error sending due date reminder:", error);
    }
  }

  /**
   * Send workspace invitation notification
   * @param workspaceId The workspace ID
   * @param userEmail The email of the invited user
   * @param inviterName The name of the user sending the invitation
   */
  async sendWorkspaceInvitation(
    workspaceId: string,
    userEmail: string,
    inviterName: string
  ) {
    try {
      // Get the workspace
      const workspace = await Workspace.findById(workspaceId).select('name description');
      if (!workspace) return;

      // Get the user if they exist in our system
      const user = await User.findOne({ email: userEmail });
      const userName = user ? user.firstName : "there";

      const data = {
        user: { name: userName, email: userEmail },
        inviterName,
        workspaceName: workspace.name,
        workspaceDescription: workspace.description || "No description",
        acceptUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspaces/${workspaceId}/join`,
        currentDate: new Date().toISOString().split('T')[0]
      };

      await sendEmail({
        email: userEmail,
        subject: `${inviterName} invited you to join "${workspace.name}" on TaskNest`,
        template: "workspaceInvitation",
        date: data
      });
    } catch (error) {
      console.error("Error sending workspace invitation:", error);
    }
  }

  /**
   * Send new comment notification
   * @param taskId The task ID
   * @param comment The comment content
   * @param authorName The name of the commenter
   */
  async sendNewCommentNotification(
    taskId: string,
    comment: string,
    authorId: string,
    authorName: string
  ) {
    try {
      // Get the task
      const task = await Task.findById(taskId).populate('assigneeId', 'email firstName _id preferences');
      if (!task) return;

      // Get the workspace
      const workspace = await Workspace.findById(task.workspaceId).select('name');
      if (!workspace) return;

      // If the task assignee has notifications enabled and isn't the commenter
      if (
        task.assigneeId && 
        (task.assigneeId as any)._id.toString() !== authorId &&
        (task.assigneeId as any).preferences?.notifications !== false
      ) {
        const data = {
          user: { 
            name: (task.assigneeId as any).firstName, 
            email: (task.assigneeId as any).email 
          },
          authorName,
          taskTitle: task.title,
          workspaceName: workspace.name,
          comment: comment.length > 200 ? comment.substring(0, 197) + '...' : comment,
          taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}`,
          currentDate: new Date().toISOString().split('T')[0]
        };

        await sendEmail({
          email: (task.assigneeId as any).email,
          subject: `${authorName} commented on task "${task.title}"`,
          template: "newComment",
          date: data
        });
      }
    } catch (error) {
      console.error("Error sending new comment notification:", error);
    }
  }
}

export default new NotificationService();