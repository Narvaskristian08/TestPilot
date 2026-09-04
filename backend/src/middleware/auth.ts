import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UserModel } from '../models/User';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    supabaseUserId: string;
    email: string;
    displayName: string | null;
  };
  supabaseUser?: any;
}

/**
 * Middleware to verify Supabase JWT token and attach user to request
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Get user from our database
    const user = await UserModel.findBySupabaseId(supabaseUser.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      supabaseUserId: user.supabase_user_id || supabaseUser.id,
      email: user.email,
      displayName: user.display_name,
    };

    req.supabaseUser = supabaseUser;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Authentication failed', 401));
  }
};

/**
 * Optional auth - attaches user if token present, but doesn't require it
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (!error && supabaseUser) {
        const user = await UserModel.findBySupabaseId(supabaseUser.id);
        if (user) {
          req.user = {
            id: user.id,
            supabaseUserId: user.supabase_user_id || supabaseUser.id,
            email: user.email,
            displayName: user.display_name,
          };
          req.supabaseUser = supabaseUser;
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, continue even if verification fails
    next();
  }
};
