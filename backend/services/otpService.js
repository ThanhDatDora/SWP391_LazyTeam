/**
 * OTP Service for Email Verification
 */

import crypto from 'crypto';
import nodemailer from 'nodemailer';

class OTPService {
  constructor() {
    // In-memory OTP storage (in production, use Redis or database)
    this.otpStore = new Map();
    
    // OTP expiration time (5 minutes)
    this.otpExpiration = 5 * 60 * 1000;
    
    // Setup nodemailer transporter
    this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    // Gmail SMTP configuration - FORCE REAL EMAIL
    if (false) { // Changed from development check to always use Gmail
      // Mock Email for testing (show OTP in terminal)
      this.transporter = {
        sendMail: async (mailOptions) => {
          const otpCode = mailOptions.html.match(/(\d{6})/)?.[1] || 'N/A';
          console.log('\n🚨 ================== OTP CODE ==================');
          console.log(`📧 Mock Email Sent to: ${mailOptions.to}`);
          console.log(`📝 Subject: ${mailOptions.subject}`);
          console.log(`🔢 OTP CODE: ${otpCode}`);
          console.log('� ===============================================\n');
          return { messageId: 'mock-message-id' };
        }
      };
      console.log('� Using Mock Email (OTP will show in terminal)');
    } else {
      // Gmail SMTP configuration with real credentials
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_EMAIL || 'btlovedh@gmail.com',
          pass: process.env.SMTP_PASSWORD || 'nafvkfuajdhgncds'
        }
      });
      console.log('📧 Gmail SMTP configured for real email sending');
      console.log(`📧 Using email: ${process.env.SMTP_EMAIL || 'btlovedh@gmail.com'}`);
    }
  }

  /**
   * Generate 6-digit OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Store OTP with expiration
   */
  storeOTP(email, otp, purpose = 'registration') {
    const key = `${email}:${purpose}`;
    const expiresAt = Date.now() + this.otpExpiration;
    
    this.otpStore.set(key, {
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    });

    // Clean up expired OTPs
    this.cleanupExpiredOTPs();
    
    return { otp, expiresAt };
  }

  /**
   * Verify OTP
   */
  verifyOTP(email, inputOTP, purpose = 'registration') {
    const key = `${email}:${purpose}`;
    const stored = this.otpStore.get(key);
    
    if (!stored) {
      return { success: false, error: 'OTP not found or expired' };
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(key);
      return { success: false, error: 'OTP has expired' };
    }

    // Check attempts
    if (stored.attempts >= stored.maxAttempts) {
      this.otpStore.delete(key);
      return { success: false, error: 'Maximum attempts exceeded' };
    }

    // Verify OTP
    if (stored.otp !== inputOTP) {
      stored.attempts++;
      return { success: false, error: 'Invalid OTP', attemptsLeft: stored.maxAttempts - stored.attempts };
    }

    // Success - remove OTP
    this.otpStore.delete(key);
    return { success: true };
  }

  /**
   * Send OTP via email
   */
  async sendOTPEmail(email, purpose = 'registration') {
    try {
      const otp = this.generateOTP();
      this.storeOTP(email, otp, purpose);

      const subject = this.getEmailSubject(purpose);
      const htmlContent = this.getEmailTemplate(otp, purpose);

      const mailOptions = {
        from: {
          name: 'Mini Coursera',
          address: process.env.SMTP_EMAIL || 'your-email@gmail.com'
        },
        to: email,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 OTP sent to ${email} for ${purpose}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        expiresIn: this.otpExpiration / 1000 // seconds
      };

    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Get email subject based on purpose
   */
  getEmailSubject(purpose) {
    switch (purpose) {
      case 'registration':
        return 'Xác thực tài khoản Mini Coursera - Mã OTP';
      case 'password_reset':
        return 'Đặt lại mật khẩu Mini Coursera - Mã OTP';
      case 'email_verification':
        return 'Xác minh email Mini Coursera - Mã OTP';
      default:
        return 'Mini Coursera - Mã xác thực OTP';
    }
  }

  /**
   * Get email template
   */
  getEmailTemplate(otp, purpose) {
    const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã xác thực OTP</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; text-align: center; }
            .otp-box { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
            .warning { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Mini Coursera</h1>
                <p>Nền tảng học trực tuyến hàng đầu</p>
            </div>
            <div class="content">
                <h2>${this.getContentTitle(purpose)}</h2>
                <p>${this.getContentMessage(purpose)}</p>
                
                <div class="otp-box">
                    <p><strong>Mã xác thực của bạn là:</strong></p>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Lưu ý quan trọng:</strong><br>
                    • Mã OTP này sẽ hết hạn sau <strong>5 phút</strong><br>
                    • Không chia sẻ mã này với bất kỳ ai<br>
                    • Chỉ nhập mã này trên website chính thức của Mini Coursera
                </div>
                
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer">
                <p>© 2025 Mini Coursera. Tất cả quyền được bảo lưu.</p>
                <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
            </div>
        </div>
    </body>
    </html>`;

    return baseTemplate;
  }

  /**
   * Get content title based on purpose
   */
  getContentTitle(purpose) {
    switch (purpose) {
      case 'registration':
        return 'Xác thực tài khoản mới';
      case 'password_reset':
        return 'Đặt lại mật khẩu';
      case 'email_verification':
        return 'Xác minh địa chỉ email';
      default:
        return 'Xác thực tài khoản';
    }
  }

  /**
   * Get content message based on purpose
   */
  getContentMessage(purpose) {
    switch (purpose) {
      case 'registration':
        return 'Chào mừng bạn đến với Mini Coursera! Để hoàn tất việc đăng ký tài khoản, vui lòng nhập mã OTP bên dưới:';
      case 'password_reset':
        return 'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhập mã OTP bên dưới để tiếp tục:';
      case 'email_verification':
        return 'Để xác minh địa chỉ email của bạn, vui lòng nhập mã OTP bên dưới:';
      default:
        return 'Vui lòng nhập mã OTP bên dưới để xác thực:';
    }
  }

  /**
   * Clean up expired OTPs
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [key, value] of this.otpStore.entries()) {
      if (now > value.expiresAt) {
        this.otpStore.delete(key);
      }
    }
  }

  /**
   * Get OTP status (for debugging)
   */
  getOTPStatus(email, purpose = 'registration') {
    const key = `${email}:${purpose}`;
    const stored = this.otpStore.get(key);
    
    if (!stored) {
      return { exists: false };
    }

    return {
      exists: true,
      expiresAt: stored.expiresAt,
      attempts: stored.attempts,
      maxAttempts: stored.maxAttempts,
      timeLeft: Math.max(0, stored.expiresAt - Date.now())
    };
  }

  /**
   * Resend OTP (with rate limiting)
   */
  async resendOTP(email, purpose = 'registration') {
    const status = this.getOTPStatus(email, purpose);
    
    if (status.exists && status.timeLeft > 240000) { // 4 minutes remaining
      throw new Error('Please wait before requesting a new OTP');
    }

    return await this.sendOTPEmail(email, purpose);
  }

  /**
   * Send password reset email with OTP
   */
  async sendPasswordResetEmail(email, fullName, resetToken) {
    try {
      const subject = 'Đặt lại mật khẩu Mini Coursera - Mã xác thực';
      const htmlContent = this.getPasswordResetTemplate(fullName, resetToken);

      const mailOptions = {
        from: {
          name: 'Mini Coursera',
          address: process.env.SMTP_EMAIL || 'btlovedh@gmail.com'
        },
        to: email,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Password reset email sent to ${email}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        expiresIn: 15 * 60 // 15 minutes in seconds
      };

    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get password reset email template
   */
  getPasswordResetTemplate(fullName, resetToken) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; text-align: center; }
            .token-box { background-color: #fef2f2; border: 2px dashed #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .reset-token { font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 8px; margin: 10px 0; }
            .warning { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .security-note { background-color: #f0f9ff; color: #0369a1; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Mini Coursera</h1>
                <p>Đặt lại mật khẩu tài khoản</p>
            </div>
            <div class="content">
                <h2>Xin chào ${fullName}!</h2>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Mini Coursera của bạn.</p>
                
                <div class="token-box">
                    <p><strong>Mã xác thực đặt lại mật khẩu:</strong></p>
                    <div class="reset-token">${resetToken}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Lưu ý quan trọng:</strong><br>
                    • Mã này sẽ hết hạn sau <strong>15 phút</strong><br>
                    • Chỉ sử dụng mã này một lần duy nhất<br>
                    • Không chia sẻ mã này với bất kỳ ai
                </div>

                <div class="security-note">
                    <strong>🛡️ Bảo mật tài khoản:</strong><br>
                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và liên hệ với chúng tôi ngay lập tức.
                </div>
                
                <p><strong>Hướng dẫn:</strong></p>
                <p>1. Quay lại trang đặt lại mật khẩu<br>
                2. Nhập mã xác thực ở trên<br>
                3. Tạo mật khẩu mới<br>
                4. Đăng nhập với mật khẩu mới</p>
            </div>
            <div class="footer">
                <p>© 2025 Mini Coursera. Tất cả quyền được bảo lưu.</p>
                <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
            </div>
        </div>
    </body>
    </html>`;
  }
}

export default OTPService;