/**
 * Email Notification Service (Backend)
 * Handles various email notifications for user actions and system events
 */

import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = new Map();
    this.loadTemplates();
  }

  createTransporter() {
    // Configure based on environment
    const config = {
      // Gmail configuration (for development)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
      }
    };

    // Production configuration (use SendGrid, Mailgun, etc.)
    if (process.env.NODE_ENV === 'production') {
      config.host = process.env.SMTP_HOST || 'smtp.sendgrid.net';
      config.port = 587;
      config.secure = false;
      config.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      };
    }

    return nodemailer.createTransporter(config);
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(process.cwd(), 'templates/email');
      const files = await fs.readdir(templatesDir).catch(() => []);
      
      for (const file of files) {
        if (file.endsWith('.html')) {
          const templateName = file.replace('.html', '');
          const templateContent = await fs.readFile(
            path.join(templatesDir, file), 
            'utf-8'
          );
          this.templates.set(templateName, templateContent);
        }
      }
    } catch {
      console.warn('Email templates directory not found, using inline templates');
      this.createDefaultTemplates();
    }
  }

  createDefaultTemplates() {
    // Welcome email template
    this.templates.set('welcome', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Mini Coursera</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Mini Coursera!</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}!</h2>
            <p>Welcome to Mini Coursera! We're excited to have you join our learning community.</p>
            <p>You can now access thousands of courses to enhance your skills and advance your career.</p>
            <a href="{{dashboardUrl}}" class="button">Start Learning</a>
          </div>
          <div class="footer">
            <p>© 2024 Mini Coursera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);

    // Course enrollment confirmation
    this.templates.set('enrollment-confirmation', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Course Enrollment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .course-info { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enrollment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}!</h2>
            <p>Great news! You're now enrolled in:</p>
            <div class="course-info">
              <h3>{{courseTitle}}</h3>
              <p><strong>Instructor:</strong> {{instructor}}</p>
              <p><strong>Duration:</strong> {{duration}}</p>
              <p><strong>Level:</strong> {{level}}</p>
            </div>
            <p>You can start learning right away. Access your course materials anytime, anywhere.</p>
            <a href="{{courseUrl}}" class="button">Start Course</a>
          </div>
          <div class="footer">
            <p>© 2024 Mini Coursera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);

    // Course completion certificate
    this.templates.set('certificate', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Course Completion Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .certificate-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; border: 2px solid #F59E0B; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}!</h2>
            <p>Congratulations on completing your course! Your dedication and hard work have paid off.</p>
            <div class="certificate-info">
              <h3>Certificate of Completion</h3>
              <h4>{{courseTitle}}</h4>
              <p><strong>Completed on:</strong> {{completionDate}}</p>
              <p><strong>Grade:</strong> {{grade}}</p>
            </div>
            <p>Your certificate is now available for download and sharing on professional networks.</p>
            <a href="{{certificateUrl}}" class="button">Download Certificate</a>
          </div>
          <div class="footer">
            <p>© 2024 Mini Coursera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);

    // Payment receipt
    this.templates.set('payment-receipt', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366F1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .receipt { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}!</h2>
            <p>Thank you for your purchase! Here's your receipt:</p>
            <div class="receipt">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> {{orderId}}</p>
              <p><strong>Course:</strong> {{courseTitle}}</p>
              <p><strong>Amount:</strong> $\${amount}</p>
              <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
              <p><strong>Date:</strong> {{paymentDate}}</p>
            </div>
            <p>You can access your course immediately from your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2024 Mini Coursera. All rights reserved.</p>
            <p>Questions? Contact us at support@minicoursera.com</p>
          </div>
        </div>
      </body>
      </html>
    `);

    // Password reset
    this.templates.set('password-reset', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 6px; }
          .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}!</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="{{resetUrl}}" class="button">Reset Password</a>
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <p>This link expires in 1 hour. If you didn't request this reset, please ignore this email.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Mini Coursera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  interpolateTemplate(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  async sendEmail({ to, subject, templateName, variables, attachments = [] }) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template "${templateName}" not found`);
      }

      const html = this.interpolateTemplate(template, variables);

      const mailOptions = {
        from: `"Mini Coursera" <${process.env.EMAIL_FROM || 'noreply@minicoursera.com'}>`,
        to,
        subject,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convenience methods for different email types

  async sendWelcomeEmail(userEmail, userName, dashboardUrl) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Mini Coursera!',
      templateName: 'welcome',
      variables: { userName, dashboardUrl }
    });
  }

  async sendEnrollmentConfirmation(userEmail, userName, courseData, courseUrl) {
    return this.sendEmail({
      to: userEmail,
      subject: `You're enrolled in ${courseData.title}!`,
      templateName: 'enrollment-confirmation',
      variables: {
        userName,
        courseTitle: courseData.title,
        instructor: courseData.instructor,
        duration: courseData.duration,
        level: courseData.level,
        courseUrl
      }
    });
  }

  async sendCertificate(userEmail, userName, courseTitle, completionDate, grade, certificateUrl) {
    return this.sendEmail({
      to: userEmail,
      subject: `Your ${courseTitle} Certificate is Ready!`,
      templateName: 'certificate',
      variables: {
        userName,
        courseTitle,
        completionDate,
        grade,
        certificateUrl
      }
    });
  }

  async sendPaymentReceipt(userEmail, userName, orderData) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Payment Receipt - Mini Coursera',
      templateName: 'payment-receipt',
      variables: {
        userName,
        orderId: orderData.id,
        courseTitle: orderData.courseTitle,
        amount: orderData.amount,
        paymentMethod: orderData.paymentMethod,
        paymentDate: new Date(orderData.createdAt).toLocaleDateString()
      }
    });
  }

  async sendPasswordReset(userEmail, userName, resetUrl) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Reset Your Password - Mini Coursera',
      templateName: 'password-reset',
      variables: { userName, resetUrl }
    });
  }

  async sendCourseReminder(userEmail, userName, courseTitle, courseUrl, daysInactive) {
    const _template = `
      <p>Hi {{userName}}!</p>
      <p>We noticed you haven't continued with "{{courseTitle}}" for {{daysInactive}} days.</p>
      <p>Don't lose momentum! Continue where you left off:</p>
      <a href="{{courseUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Continue Learning</a>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Continue your ${courseTitle} journey`,
      templateName: 'custom',
      variables: { userName, courseTitle, courseUrl, daysInactive }
    });
  }

  async sendBulkNotification(recipients, subject, content) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient.email,
          subject,
          templateName: 'custom',
          variables: { userName: recipient.name, content }
        });
        results.push({ email: recipient.email, ...result });
      } catch (error) {
        results.push({ 
          email: recipient.email, 
          success: false, 
          error: error.message 
        });
      }
      
      // Rate limiting - wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Health check method
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default EmailService;