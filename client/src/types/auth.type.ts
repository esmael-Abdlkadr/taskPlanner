export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    preferences?: {
      theme?: 'light' | 'dark';
      notifications?: boolean;
    };
  }
  
  export interface AuthResponse {
    status: string;
    message: string;
    data: {
      user: User;
      accessToken: string;
      workspaces: WorkspaceBasic[];
    };
  }
  
  export interface WorkspaceBasic {
    _id: string;
    name: string;
    color: string;
    icon: string;
  }
  
  export interface SignupData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }