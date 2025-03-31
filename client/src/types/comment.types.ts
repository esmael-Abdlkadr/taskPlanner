export interface CommentUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Comment {
  _id: string;
  taskId: string;
  userId: CommentUser;
  content: string;
  attachments?: Attachment[];
  mentions?: string[];
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  id: string;
}
