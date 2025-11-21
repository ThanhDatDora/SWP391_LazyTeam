/**
 * Environment Validation Utility
 * Validates required environment variables on application startup
 */

export class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate that a required environment variable exists
   */
  requireEnv(name, description = '') {
    if (!process.env[name]) {
      this.errors.push({
        variable: name,
        description,
        message: `Missing required environment variable: ${name}`
      });
      return false;
    }
    return true;
  }

  /**
   * Validate optional environment variable with warning
   */
  optionalEnv(name, defaultValue, description = '') {
    if (!process.env[name]) {
      this.warnings.push({
        variable: name,
        defaultValue,
        description,
        message: `Optional environment variable ${name} not set, using default: ${defaultValue}`
      });
      return false;
    }
    return true;
  }

  /**
   * Validate environment variable format
   */
  validateFormat(name, pattern, description = '') {
    const value = process.env[name];
    if (!value) {
      return false;
    }

    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      this.errors.push({
        variable: name,
        description,
        message: `Invalid format for ${name}: expected pattern ${pattern}`
      });
      return false;
    }
    return true;
  }

  /**
   * Validate number environment variable
   */
  validateNumber(name, min = null, max = null) {
    const value = process.env[name];
    if (!value) {
      return false;
    }

    const num = Number(value);
    if (isNaN(num)) {
      this.errors.push({
        variable: name,
        message: `${name} must be a number, got: ${value}`
      });
      return false;
    }

    if (min !== null && num < min) {
      this.errors.push({
        variable: name,
        message: `${name} must be >= ${min}, got: ${num}`
      });
      return false;
    }

    if (max !== null && num > max) {
      this.errors.push({
        variable: name,
        message: `${name} must be <= ${max}, got: ${num}`
      });
      return false;
    }

    return true;
  }

  /**
   * Validate enum values
   */
  validateEnum(name, allowedValues) {
    const value = process.env[name];
    if (!value) {
      return false;
    }

    if (!allowedValues.includes(value)) {
      this.errors.push({
        variable: name,
        message: `${name} must be one of: ${allowedValues.join(', ')}, got: ${value}`
      });
      return false;
    }
    return true;
  }

  /**
   * Report validation results
   */
  report() {
    if (this.errors.length > 0) {
      console.error('\n❌ ENVIRONMENT VALIDATION FAILED\n');
      console.error('Critical errors found:');
      this.errors.forEach((error, index) => {
        console.error(`\n${index + 1}. ${error.variable}`);
        console.error(`   ${error.message}`);
        if (error.description) {
          console.error(`   Description: ${error.description}`);
        }
      });
      console.error('\n💡 Please check your .env file and compare with .env.template\n');
      return false;
    }

    if (this.warnings.length > 0) {
      console.warn('\n⚠️  ENVIRONMENT WARNINGS\n');
      this.warnings.forEach((warning, index) => {
        console.warn(`${index + 1}. ${warning.variable}: ${warning.message}`);
      });
      console.warn('');
    }

    console.log('✅ Environment validation passed\n');
    return true;
  }

  /**
   * Throw error if validation fails
   */
  validate() {
    const isValid = this.report();
    if (!isValid && process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Cannot start in production mode.');
    }
    return isValid;
  }
}

/**
 * Validate backend environment
 */
export function validateBackendEnvironment() {
  const validator = new EnvironmentValidator();

  // Server configuration
  validator.requireEnv('PORT', 'Server port number');
  validator.optionalEnv('NODE_ENV', 'development', 'Node environment');
  validator.requireEnv('FRONTEND_URL', 'Frontend application URL for CORS');

  // Database configuration
  validator.requireEnv('DB_SERVER', 'SQL Server hostname or IP');
  validator.requireEnv('DB_NAME', 'Database name');
  validator.requireEnv('DB_USER', 'Database username');
  validator.requireEnv('DB_PASSWORD', 'Database password');
  
  if (process.env.PORT) {
    validator.validateNumber('PORT', 1, 65535);
  }
  
  if (process.env.DB_PORT) {
    validator.validateNumber('DB_PORT', 1, 65535);
  }

  // Security
  validator.requireEnv('JWT_SECRET', 'JWT secret key for token signing');
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    validator.errors.push({
      variable: 'JWT_SECRET',
      message: 'JWT_SECRET should be at least 32 characters long for security'
    });
  }

  // Optional but recommended
  validator.optionalEnv('SESSION_SECRET', 'random_secret', 'Session secret key');
  validator.optionalEnv('LOG_LEVEL', 'info', 'Logging level');

  // Validate NODE_ENV
  if (process.env.NODE_ENV) {
    validator.validateEnum('NODE_ENV', ['development', 'production', 'test']);
  }

  return validator.validate();
}

export default {
  EnvironmentValidator,
  validateBackendEnvironment
};
