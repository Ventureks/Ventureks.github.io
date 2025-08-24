import nodemailer from 'nodemailer';
import type { Email } from '@shared/schema';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: SMTPConfig | null = null;

  constructor() {
    this.initializeFromEnvironment();
  }

  private initializeFromEnvironment() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && port && user && pass) {
      this.configure({
        host,
        port: parseInt(port),
        secure,
        auth: { user, pass }
      });
    }
  }

  configure(config: SMTPConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }

  async sendEmail(emailData: {
    to: string;
    subject: string;
    content: string;
    from?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'SMTP nie jest skonfigurowany. Sprawdź ustawienia SMTP.'
      };
    }

    try {
      const info = await this.transporter!.sendMail({
        from: emailData.from || this.config!.auth.user,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.content,
        html: emailData.content.replace(/\n/g, '<br>'),
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Błąd wysyłania emaila:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd SMTP'
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'SMTP nie jest skonfigurowany'
      };
    }

    try {
      await this.transporter!.verify();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd połączenia SMTP'
      };
    }
  }

  getConfig(): SMTPConfig | null {
    return this.config;
  }
}

export const emailService = new EmailService();