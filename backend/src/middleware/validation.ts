import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { isIP } from 'is-ip';
import { AppError } from './errorHandler';
import { PRIVATE_IP_RANGES, BLOCKED_HOSTS } from '../config/constants';

/**
 * Validate URL format and protocol
 */
export const validateUrl = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    })
    .withMessage('Invalid URL format. Must start with http:// or https://')
    .isLength({ max: 2048 })
    .withMessage('URL too long (max 2048 characters)'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

/**
 * SSRF Protection Middleware
 * Prevents Server-Side Request Forgery attacks by blocking:
 * - Private IP addresses
 * - Localhost
 * - Internal network addresses
 * - Cloud metadata endpoints
 */
export const ssrfProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const url = req.body.url;
    
    if (!url) {
      throw new AppError('URL is required', 400);
    }

    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check for blocked hostnames
    if (BLOCKED_HOSTS.includes(hostname)) {
      throw new AppError(
        'This URL is blocked for security reasons (metadata endpoint)',
        403
      );
    }

    // Check for localhost
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.local')
    ) {
      throw new AppError(
        'Cannot test localhost or local network addresses',
        403
      );
    }

    // Check if hostname is an IP address
    if (isIP(hostname)) {
      if (isPrivateIP(hostname)) {
        throw new AppError(
          'Cannot test private IP addresses',
          403
        );
      }
    }

    // Check for private domain patterns
    const privatePatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^127\./,
    ];

    for (const pattern of privatePatterns) {
      if (pattern.test(hostname)) {
        throw new AppError(
          'Cannot test private network addresses',
          403
        );
      }
    }

    // Additional security checks
    if (parsedUrl.username || parsedUrl.password) {
      throw new AppError(
        'URLs with credentials are not allowed',
        400
      );
    }

    // Check for unusual ports that might be used for internal services
    const port = parsedUrl.port;
    if (port) {
      const portNum = parseInt(port);
      const restrictedPorts = [22, 23, 25, 110, 143, 3306, 5432, 6379, 27017]; // SSH, Telnet, SMTP, MySQL, PostgreSQL, Redis, MongoDB
      
      if (restrictedPorts.includes(portNum)) {
        throw new AppError(
          `Port ${portNum} is restricted for security reasons`,
          403
        );
      }
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    
    return res.status(400).json({
      status: 'error',
      message: 'Invalid URL',
    });
  }
};

/**
 * Check if an IP address is private
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  const ipv4Patterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
  ];

  for (const pattern of ipv4Patterns) {
    if (pattern.test(ip)) {
      return true;
    }
  }

  // IPv6 private ranges
  if (ip.includes(':')) {
    if (
      ip === '::1' ||
      ip.startsWith('fc') ||
      ip.startsWith('fd') ||
      ip.startsWith('fe80')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Validate test run ID parameter
 */
export const validateTestRunId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid test run ID',
    });
  }
  
  next();
};
