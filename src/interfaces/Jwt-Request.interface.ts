import { Request } from "express";

export interface JWTRequest extends Request {

  userId: string;
  email: string;
  roles: string[];  
}
