import { IUser } from "./types";
import { Workspace } from "../../models/Workspace";
declare module "mongoose" {
  interface Document {
    comparePassword(
      candidatePassword: string,
      userPassword: string
    ): Promise<boolean>;
  }
}

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      workspace?: Workspace;
    }
  }
}