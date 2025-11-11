// Auto-add Test Users to Google OAuth Consent Screen
// Requires Google Cloud SDK and proper authentication

// Configuration
const _PROJECT_ID = 'your-google-cloud-project-id';
const _CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

async function addTestUsers(emails) {
  try {
    // This would require Google Cloud Console API access
    // Which needs additional setup and permissions
    
    console.log('🔧 Auto-adding test users is complex and requires:');
    console.log('1. Google Cloud SDK setup');
    console.log('2. Service Account with Cloud Console API access');
    console.log('3. Additional OAuth scopes');
    console.log('');
    console.log('📝 For now, please manually add test users:');
    console.log('https://console.cloud.google.com/apis/credentials/consent');
    console.log('');
    console.log('📧 Emails to add:');
    emails.forEach(email => console.log(`   - ${email}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// List of common test emails
const testEmails = [
  'huy484820@gmail.com',
  'btlovedh@gmail.com'
  // Add more emails as needed
];

addTestUsers(testEmails);