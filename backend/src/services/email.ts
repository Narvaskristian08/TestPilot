import { Resend } from 'resend';
import { CONFIG } from '../config/constants';

// Only initialize Resend if API key is provided
const resend = CONFIG.RESEND_API_KEY ? new Resend(CONFIG.RESEND_API_KEY) : null;

if (!CONFIG.RESEND_API_KEY) {
  console.warn('⚠️  Resend API key not configured. Emails will not be sent.');
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Email service using Resend
 */
export class EmailService {
  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<{ id: string }> {
    if (!resend) {
      console.warn('Email not sent (Resend not configured):', options.subject, 'to', options.to);
      return { id: 'email-disabled' };
    }

    try {
      const result = await resend.emails.send({
        from: options.from || CONFIG.RESEND_FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return result.data as { id: string };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, displayName?: string): Promise<{ id: string }> {
    const html = this.getWelcomeTemplate({
      name: displayName || email,
    });

    return this.send({
      to: email,
      subject: 'Welcome to QA Auto! 🎭',
      html,
    });
  }

  /**
   * Get welcome email HTML template
   */
  private getWelcomeTemplate(data: { name: string }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      font-size: 48px;
    }
    .content {
      padding: 20px 0;
    }
    .highlight-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🎭</div>
    <h1>Welcome to QA Auto!</h1>
  </div>

  <div class="content">
    <p>Hi ${data.name},</p>
    <p>Welcome aboard! Your QA Auto account has been successfully created.</p>

    <div class="highlight-box">
      <h2 style="margin: 0;">20 QA runs per day!</h2>
      <p style="margin: 10px 0 0 0;">Start testing websites right away</p>
    </div>

    <p>QA Auto automatically tests your websites for:</p>
    <ul>
      <li>🔗 Broken links and navigation issues</li>
      <li>📱 Mobile responsiveness</li>
      <li>♿ Accessibility compliance</li>
      <li>🎨 UI/UX problems</li>
      <li>⚡ Performance issues</li>
      <li>🐛 Console errors and network failures</li>
    </ul>

    <center>
      <a href="${CONFIG.FRONTEND_URL}" class="button">Start Your First Test</a>
    </center>

    <p>Your daily limit resets every day at midnight.</p>
  </div>

  <div class="footer">
    <p>Happy testing! 🚀</p>
    <p>The QA Auto Team</p>
  </div>
</body>
</html>
    `;
  }
}

export const emailService = new EmailService();
