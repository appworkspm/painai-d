import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security middleware that configures Helmet with appropriate security headers
 * and Content Security Policy (CSP) to allow necessary resources while maintaining security.
 */
export const securityMiddleware = [
  // Basic Helmet security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",  // Required for some legacy browsers and certain frameworks
          "'unsafe-eval'"    // Required for some libraries that use eval()
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'"  // Required for inline styles
        ],
        imgSrc: [
          "'self'",
          'data:',            // Required for data: URLs (e.g., inline images)
          'blob:'            // Required for blob: URLs (e.g., file uploads)
        ],
        connectSrc: [
          "'self'",
          'https://*.google-analytics.com',  // Example: Google Analytics
          'https://*.stripe.com'            // Example: Stripe payments
        ],
        fontSrc: [
          "'self'",
          'data:'                            // Required for data: URLs in fonts
        ],
        objectSrc: ["'none'"],              // No plugins
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      },
    },
    // Disable the following if not needed for your application
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    dnsPrefetchControl: false,
    frameguard: {
      action: 'deny'
    },
    hsts: {
      maxAge: 15552000,  // 180 days in seconds
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true
  }),
  
  // CORS headers
  (req: Request, res: Response, next: NextFunction): void => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  }
];
