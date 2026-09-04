import { Router, Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { DailyUsageModel } from '../models/DailyUsage';
import { emailService } from '../services/email';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account (called after Supabase signup)
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { supabaseUserId, email, displayName } = req.body;

    if (!supabaseUserId || !email) {
      throw new AppError('Supabase user ID and email are required', 400);
    }

    // Check if user already exists
    const existing = await UserModel.findBySupabaseId(supabaseUserId);
    if (existing) {
      return res.json({
        status: 'success',
        message: 'User already exists',
        data: existing,
      });
    }

    // Create user profile
    const user = await UserModel.create({
      supabase_user_id: supabaseUserId,
      email,
      display_name: displayName || null,
    });

    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail(user.email, user.display_name || undefined).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
    });
  })
);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserModel.findById(req.user!.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
      },
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { displayName } = req.body;

    const updated = await UserModel.update(req.user!.id, {
      display_name: displayName,
    });

    if (!updated) {
      throw new AppError('Failed to update profile', 500);
    }

    return res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updated,
    });
  })
);

/**
 * GET /api/auth/usage
 * Get usage statistics for current user
 */
router.get(
  '/usage',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await DailyUsageModel.getUsageStats(req.user!.id);

    return res.json({
      status: 'success',
      data: {
        used: stats.used,
        limit: stats.limit,
        remaining: stats.remaining,
        hasExceeded: stats.hasExceeded,
        resetsAt: stats.resetsAt,
      },
    });
  })
);

/**
 * GET /api/auth/usage/history
 * Get usage history for current user
 */
router.get(
  '/usage/history',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 7;
    const history = await DailyUsageModel.getUsageHistory(req.user!.id, days);

    return res.json({
      status: 'success',
      data: history,
    });
  })
);

export default router;
