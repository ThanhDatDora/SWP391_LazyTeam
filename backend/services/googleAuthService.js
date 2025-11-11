/**
 * Google OAuth Service for Gmail Authentication
 */

import { google } from 'googleapis';
import crypto from 'crypto';

class GoogleAuthService {
  constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
    );

    // Set up Gmail API
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    // Scopes for Gmail access
    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.send'
    ];
  }

  /**
   * Generate Google OAuth URL for login
   */
  getAuthUrl(state = null) {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: state || crypto.randomBytes(32).toString('hex'),
      prompt: 'consent'
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens from code:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken) {
    try {
      // Set credentials
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      // Get user info
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        verified_email: data.verified_email
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user information from Google');
    }
  }

  /**
   * Send email via Gmail API
   */
  async sendEmail(to, subject, htmlBody, accessToken = null) {
    try {
      if (accessToken) {
        this.oauth2Client.setCredentials({ access_token: accessToken });
      }

      // Create email message
      const message = this.createEmailMessage(to, subject, htmlBody);
      
      // Send email
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message
        }
      });

      return result.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email via Gmail');
    }
  }

  /**
   * Create base64 encoded email message
   */
  createEmailMessage(to, subject, htmlBody) {
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody
    ];

    const message = messageParts.join('\n');
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Verify access token is valid
   */
  async verifyToken(accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const tokenInfo = await this.oauth2Client.getTokenInfo(accessToken);
      return tokenInfo;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}

export default GoogleAuthService;