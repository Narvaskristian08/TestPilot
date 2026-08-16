/**
 * Test Data Utilities
 * Provides non-sensitive test data for automated tests
 * DO NOT store real passwords or secrets here
 */

export const testData = {
  /**
   * Valid test user credentials
   * These should match test accounts in your test environment
   */
  validUser: {
    email: process.env.TEST_USERNAME || process.env.TEST_EMAIL || 'test.user@example.com',
    password: process.env.TEST_PASSWORD || 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
  },

  /**
   * Invalid credentials for negative testing
   */
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!',
  },

  /**
   * Test user for registration
   */
  newUser: {
    email: `new.user.${Date.now()}@example.com`,
    password: 'NewUserPassword123!',
    firstName: 'New',
    lastName: 'User',
  },

  /**
   * Form validation test data
   */
  forms: {
    validEmail: 'valid@example.com',
    invalidEmails: [
      'invalid',
      'invalid@',
      '@invalid.com',
      'invalid@.com',
      'invalid..email@example.com',
    ],
    validPhoneNumbers: [
      '+1234567890',
      '(123) 456-7890',
      '123-456-7890',
    ],
    invalidPhoneNumbers: [
      '123',
      'abcdefghij',
      '++++++',
    ],
    shortPassword: '123',
    mediumPassword: 'Pass123!',
    strongPassword: 'StrongPassword123!@#',
    weakPasswords: [
      'password',
      '12345678',
      'qwerty',
      'abc123',
    ],
  },

  /**
   * Search test data
   */
  search: {
    validQuery: 'test search query',
    emptyQuery: '',
    specialCharacters: '!@#$%^&*()',
    longQuery: 'a'.repeat(500),
    sqlInjection: "'; DROP TABLE users; --",
    xssAttempt: '<script>alert("xss")</script>',
  },

  /**
   * CRUD test data
   */
  crud: {
    create: {
      title: 'Test Item',
      description: 'This is a test item created by automation',
      status: 'active',
    },
    update: {
      title: 'Updated Test Item',
      description: 'This item has been updated by automation',
      status: 'inactive',
    },
  },

  /**
   * Pagination test data
   */
  pagination: {
    itemsPerPage: [10, 25, 50, 100],
    defaultItemsPerPage: 10,
  },

  /**
   * File upload test data
   */
  files: {
    validImageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    validDocumentExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    invalidExtensions: ['.exe', '.bat', '.sh', '.zip'],
    maxFileSizeMB: 10,
  },

  /**
   * Timeout configurations for different scenarios
   */
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    upload: 60000,
  },

  /**
   * URL paths (relative to base URL)
   */
  urls: {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    profile: '/profile',
    settings: '/settings',
    logout: '/logout',
  },

  /**
   * Error messages to validate
   */
  errorMessages: {
    invalidCredentials: /invalid (credentials|username|password|email)/i,
    requiredField: /required|cannot be empty|must not be blank/i,
    invalidEmail: /invalid email|enter a valid email/i,
    passwordTooShort: /password (is )?too short|password must be at least/i,
    unauthorized: /unauthorized|not authorized|access denied/i,
    notFound: /not found|404/i,
    serverError: /server error|500|something went wrong/i,
  },

  /**
   * Success messages to validate
   */
  successMessages: {
    loginSuccess: /login successful|welcome|successfully logged in/i,
    logoutSuccess: /logout successful|logged out|signed out/i,
    createSuccess: /created successfully|added successfully/i,
    updateSuccess: /updated successfully|saved successfully/i,
    deleteSuccess: /deleted successfully|removed successfully/i,
  },
};

/**
 * Generate random test data
 */
export class TestDataGenerator {
  /**
   * Generate random email
   */
  static randomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `test.${timestamp}.${random}@example.com`;
  }

  /**
   * Generate random username
   */
  static randomUsername(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `testuser_${timestamp}_${random}`;
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generate random number in range
   */
  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random phone number
   */
  static randomPhoneNumber(): string {
    const areaCode = this.randomNumber(200, 999);
    const prefix = this.randomNumber(200, 999);
    const lineNumber = this.randomNumber(1000, 9999);
    return `(${areaCode}) ${prefix}-${lineNumber}`;
  }

  /**
   * Generate unique ID
   */
  static uniqueId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate test item with unique data
   */
  static generateTestItem(prefix: string = 'Test'): {
    title: string;
    description: string;
    id: string;
  } {
    const id = this.uniqueId();
    return {
      id,
      title: `${prefix} Item ${id}`,
      description: `This is a test item with ID ${id}`,
    };
  }
}

/**
 * Viewport sizes for responsive testing
 */
export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
};

/**
 * Browser configurations
 */
export const browsers = {
  chromium: 'chromium',
  firefox: 'firefox',
  webkit: 'webkit',
};
