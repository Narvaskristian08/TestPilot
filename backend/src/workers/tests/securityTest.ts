import { Page } from 'playwright';
import { TEST_RESULT_STATUS, ERROR_CATEGORY } from '../../config/constants';
import type { TestExecutionResult } from '../playwrightWorker';

/**
 * Security Test - Check for exposed secrets and OWASP vulnerabilities
 *
 * Checks for:
 * 1. Environment variables leaked to window object
 * 2. Sensitive data in console logs
 * 3. API keys exposed in page source
 * 4. Database credentials in scripts
 * 5. Common security misconfigurations
 * 6. OWASP Top 10 vulnerabilities:
 *    - A01: Broken Access Control
 *    - A02: Cryptographic Failures
 *    - A03: Injection vulnerabilities
 *    - A05: Security Misconfiguration
 *    - A06: Vulnerable Components
 *    - A07: Authentication Failures
 */
export async function runSecurityTest(page: Page, url: string): Promise<TestExecutionResult> {
  const startTime = Date.now();
  const issues: string[] = [];
  const details: any = {
    envVariablesExposed: [],
    sensitiveConsoleMessages: [],
    exposedKeys: [],
    securityHeaders: {},
    owaspFindings: [],
    recommendations: [],
  };

  try {
    // 1. Check for environment variables on window object
    const envVars = await page.evaluate(() => {
      const exposed: string[] = [];

      // Common env variable patterns
      const patterns = [
        'process.env',
        'NODE_ENV',
        'API_KEY',
        'SECRET',
        'PASSWORD',
        'TOKEN',
        'CREDENTIALS',
        'DATABASE',
        'MONGODB',
        'POSTGRES',
        'MYSQL',
        'AWS_',
        'STRIPE_',
        'GOOGLE_',
        'FIREBASE_',
      ];

      // Check window object
      const windowKeys = Object.keys(window as any);
      for (const key of windowKeys) {
        const upperKey = key.toUpperCase();
        if (patterns.some(p => upperKey.includes(p))) {
          try {
            const value = (window as any)[key];
            if (typeof value === 'string' || typeof value === 'object') {
              exposed.push(`window.${key}`);
            }
          } catch (e) {
            // Ignore access errors
          }
        }
      }

      // Check for process.env specifically
      if (typeof (window as any).process !== 'undefined') {
        exposed.push('window.process (Node.js environment exposed!)');
      }

      return exposed;
    });

    if (envVars.length > 0) {
      details.envVariablesExposed = envVars;
      issues.push(`Found ${envVars.length} potentially exposed environment variable(s)`);
    }

    // 2. Check console messages for sensitive patterns
    const consoleMessages: string[] = [];
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i,
      /bearer\s+[a-zA-Z0-9]/i,
      /authorization:/i,
      /credentials/i,
      /private[_-]?key/i,
      /access[_-]?token/i,
      /refresh[_-]?token/i,
      /session[_-]?id/i,
      /jwt/i,
    ];

    page.on('console', (msg) => {
      const text = msg.text();
      for (const pattern of sensitivePatterns) {
        if (pattern.test(text)) {
          consoleMessages.push(text.substring(0, 200)); // Limit length
          break;
        }
      }
    });

    // Wait a bit for console messages
    await page.waitForTimeout(2000);

    if (consoleMessages.length > 0) {
      details.sensitiveConsoleMessages = consoleMessages;
      issues.push(`Found ${consoleMessages.length} console message(s) with sensitive patterns`);
    }

    // 3. Check page source for API keys and secrets
    const pageContent = await page.content();
    const keyPatterns = [
      { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
      { name: 'Generic API Key', regex: /api[_-]?key[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/gi },
      { name: 'Google API Key', regex: /AIza[0-9A-Za-z_-]{35}/g },
      { name: 'Firebase Key', regex: /firebase[_-]?key[\s]*[:=][\s]*['"]([^'"]{20,})['"]/gi },
      { name: 'Stripe Key', regex: /(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}/g },
      { name: 'JWT Token', regex: /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g },
      { name: 'Private Key', regex: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g },
      { name: 'Connection String', regex: /(mongodb|mysql|postgres):\/\/[^\s'"<>]+/gi },
    ];

    const foundKeys: Array<{type: string; sample: string}> = [];
    for (const pattern of keyPatterns) {
      const matches = pageContent.match(pattern.regex);
      if (matches && matches.length > 0) {
        foundKeys.push({
          type: pattern.name,
          sample: matches[0].substring(0, 50) + '...',
        });
      }
    }

    if (foundKeys.length > 0) {
      details.exposedKeys = foundKeys;
      issues.push(`Found ${foundKeys.length} potential API key(s) or secret(s) in page source`);
    }

    // 4. Check security headers
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    const headers = response?.headers() || {};

    const securityHeaders = {
      'X-Frame-Options': headers['x-frame-options'] || 'Missing',
      'X-Content-Type-Options': headers['x-content-type-options'] || 'Missing',
      'Strict-Transport-Security': headers['strict-transport-security'] || 'Missing',
      'Content-Security-Policy': headers['content-security-policy'] || 'Missing',
      'X-XSS-Protection': headers['x-xss-protection'] || 'Missing',
      'Referrer-Policy': headers['referrer-policy'] || 'Missing',
    };

    details.securityHeaders = securityHeaders;

    const missingHeaders = Object.entries(securityHeaders)
      .filter(([_, value]) => value === 'Missing')
      .map(([key, _]) => key);

    if (missingHeaders.length > 0) {
      details.recommendations.push(`Consider adding security headers: ${missingHeaders.join(', ')}`);
    }

    // 5. Check for localStorage/sessionStorage exposure
    const storageCheck = await page.evaluate(() => {
      const issues: string[] = [];
      const sensitiveKeys = ['token', 'password', 'secret', 'key', 'auth', 'session'];

      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
          issues.push(`localStorage.${key}`);
        }
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
          issues.push(`sessionStorage.${key}`);
        }
      }

      return issues;
    });

    if (storageCheck.length > 0) {
      details.storageExposure = storageCheck;
      issues.push(`Found ${storageCheck.length} potentially sensitive key(s) in localStorage/sessionStorage`);
      details.recommendations.push('Avoid storing sensitive data in browser storage. Use httpOnly cookies or memory storage instead.');
    }

    // 6. OWASP Top 10 Checks
    const owaspChecks = await page.evaluate(() => {
      const findings: Array<{category: string; severity: string; issue: string}> = [];

      // A01: Broken Access Control - Check for exposed admin/debug interfaces
      const suspiciousElements = document.querySelectorAll('[id*="admin"], [class*="admin"], [id*="debug"], [class*="debug"]');
      if (suspiciousElements.length > 0) {
        findings.push({
          category: 'A01: Broken Access Control',
          severity: 'medium',
          issue: `Found ${suspiciousElements.length} element(s) with admin/debug identifiers potentially exposed`,
        });
      }

      // A02: Cryptographic Failures - Check for mixed content
      const insecureResources = Array.from(document.querySelectorAll('script[src], link[href], img[src]'))
        .map((el: any) => el.src || el.href)
        .filter(url => url && url.startsWith('http://'));

      if (insecureResources.length > 0 && window.location.protocol === 'https:') {
        findings.push({
          category: 'A02: Cryptographic Failures',
          severity: 'high',
          issue: `Mixed content warning: ${insecureResources.length} resource(s) loaded over HTTP on HTTPS page`,
        });
      }

      // A03: Injection - Check for inline event handlers (potential XSS)
      const inlineEvents = document.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
      if (inlineEvents.length > 5) {
        findings.push({
          category: 'A03: Injection',
          severity: 'medium',
          issue: `Found ${inlineEvents.length} inline event handlers (potential XSS vector)`,
        });
      }

      // A03: SQL Injection indicators in forms
      const forms = document.querySelectorAll('form');
      const formActions = Array.from(forms).map((form: any) => form.action).filter(Boolean);
      const sqlPatterns = formActions.filter(action => /\.(php|asp|jsp)/.test(action));
      if (sqlPatterns.length > 0) {
        findings.push({
          category: 'A03: Injection',
          severity: 'info',
          issue: `${sqlPatterns.length} form(s) submit to server-side scripts - ensure SQL injection protection`,
        });
      }

      // A05: Security Misconfiguration - Check for error messages
      const bodyText = document.body.innerText.toLowerCase();
      const errorPatterns = [
        'stack trace',
        'exception',
        'sql error',
        'database error',
        'fatal error',
        'warning: ',
        'notice: ',
        'undefined index',
        'mysql_',
        'pg_connect',
      ];

      const foundErrors = errorPatterns.filter(pattern => bodyText.includes(pattern));
      if (foundErrors.length > 0) {
        findings.push({
          category: 'A05: Security Misconfiguration',
          severity: 'high',
          issue: `Error messages/stack traces exposed in page content: ${foundErrors.join(', ')}`,
        });
      }

      // A05: Check for default/test pages
      const suspiciousText = ['phpinfo()', 'test page', 'welcome to', 'default page', 'it works!'];
      const defaultPage = suspiciousText.filter(text => bodyText.includes(text.toLowerCase()));
      if (defaultPage.length > 0 && document.title.toLowerCase().includes('test')) {
        findings.push({
          category: 'A05: Security Misconfiguration',
          severity: 'medium',
          issue: 'Possible default/test page still accessible',
        });
      }

      // A06: Vulnerable Components - Check for outdated libraries
      const scripts = Array.from(document.querySelectorAll('script[src]')).map((s: any) => s.src);
      const oldJquery = scripts.find(src => /jquery[.-]1\.|jquery[.-]2\./i.test(src));
      if (oldJquery) {
        findings.push({
          category: 'A06: Vulnerable Components',
          severity: 'medium',
          issue: 'Outdated jQuery version detected (v1.x or v2.x has known vulnerabilities)',
        });
      }

      // A06: Check for known vulnerable libraries
      const vulnerablePatterns = [
        { pattern: /angular\.js.*1\.[0-5]/i, name: 'AngularJS 1.0-1.5 (CVEs present)' },
        { pattern: /lodash.*[0-3]\./i, name: 'Lodash <4.0 (prototype pollution)' },
        { pattern: /moment\.js.*2\.1[0-7]/i, name: 'Moment.js <2.29.2 (ReDoS)' },
      ];

      for (const vuln of vulnerablePatterns) {
        if (scripts.some(src => vuln.pattern.test(src))) {
          findings.push({
            category: 'A06: Vulnerable Components',
            severity: 'high',
            issue: `Vulnerable library detected: ${vuln.name}`,
          });
        }
      }

      // A07: Authentication Failures - Check for password fields without autocomplete
      const passwordFields = document.querySelectorAll('input[type="password"]');
      const insecurePasswords = Array.from(passwordFields).filter((field: any) => {
        return !field.autocomplete || field.autocomplete === 'on';
      });

      if (insecurePasswords.length > 0) {
        findings.push({
          category: 'A07: Authentication Failures',
          severity: 'low',
          issue: `${insecurePasswords.length} password field(s) without proper autocomplete attribute`,
        });
      }

      // Check for "Remember Me" checkboxes (security concern)
      const rememberMe = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter((cb: any) => {
        const label = cb.labels?.[0]?.innerText || cb.placeholder || cb.name || '';
        return /remember|stay.*logged|keep.*signed/i.test(label);
      });

      if (rememberMe.length > 0) {
        findings.push({
          category: 'A07: Authentication Failures',
          severity: 'info',
          issue: '"Remember Me" functionality detected - ensure secure session handling',
        });
      }

      // A08: Software and Data Integrity - Check for CDN resources without SRI
      const cdnResources = Array.from(document.querySelectorAll('script[src], link[href]'))
        .filter((el: any) => {
          const src = el.src || el.href;
          return src && (src.includes('cdn.') || src.includes('cloudflare') || src.includes('jsdelivr'));
        })
        .filter((el: any) => !el.integrity);

      if (cdnResources.length > 0) {
        findings.push({
          category: 'A08: Software and Data Integrity',
          severity: 'medium',
          issue: `${cdnResources.length} CDN resource(s) loaded without Subresource Integrity (SRI)`,
        });
      }

      // A09: Security Logging Failures - Check for visible error logs
      const consoleVisible = document.querySelector('[class*="console"], [id*="console"], [class*="debug-"]');
      if (consoleVisible) {
        findings.push({
          category: 'A09: Security Logging Failures',
          severity: 'medium',
          issue: 'Debug console or logging interface visible in production',
        });
      }

      // A10: Server-Side Request Forgery (SSRF) - Check for user-controllable URLs
      const urlInputs = Array.from(document.querySelectorAll('input[type="url"], input[name*="url"], input[placeholder*="url"]'));
      if (urlInputs.length > 0) {
        findings.push({
          category: 'A10: SSRF',
          severity: 'info',
          issue: `${urlInputs.length} URL input field(s) detected - ensure server-side validation and SSRF protection`,
        });
      }

      return findings;
    });

    if (owaspChecks.length > 0) {
      details.owaspFindings = owaspChecks;

      const highSeverity = owaspChecks.filter(c => c.severity === 'high').length;
      const mediumSeverity = owaspChecks.filter(c => c.severity === 'medium').length;

      if (highSeverity > 0) {
        issues.push(`Found ${highSeverity} high-severity OWASP issue(s)`);
      }
      if (mediumSeverity > 0) {
        issues.push(`Found ${mediumSeverity} medium-severity OWASP issue(s)`);
      }
    }

    // Determine final status
    const duration = Date.now() - startTime;

    const highSeverityOwasp = owaspChecks.filter(c => c.severity === 'high').length;
    const criticalIssues = foundKeys.length > 0 || envVars.length > 0 || highSeverityOwasp > 0;

    if (criticalIssues) {
      // Critical: actual secrets exposed or high-severity OWASP issues
      return {
        testName: 'Security Check',
        testType: 'SECURITY',
        status: TEST_RESULT_STATUS.FAILED,
        error_message: `Security issues found: ${issues.join('; ')}`,
        error_category: ERROR_CATEGORY.SECURITY,
        expected_behavior: 'No API keys, secrets, or critical security vulnerabilities should be exposed',
        actual_behavior: issues.join('; '),
        url,
        details,
        duration_ms: duration,
      };
    } else if (consoleMessages.length > 0 || storageCheck.length > 0 || missingHeaders.length > 3 || owaspChecks.length > 0) {
      // Warning: potential security concerns
      return {
        testName: 'Security Check',
        testType: 'SECURITY',
        status: TEST_RESULT_STATUS.WARNING,
        error_message: `Security concerns detected: ${issues.join('; ')}`,
        error_category: ERROR_CATEGORY.SECURITY,
        expected_behavior: 'Follow security best practices',
        actual_behavior: issues.join('; '),
        url,
        details,
        duration_ms: duration,
      };
    } else {
      // Passed
      return {
        testName: 'Security Check',
        testType: 'SECURITY',
        status: TEST_RESULT_STATUS.PASSED,
        url,
        details: {
          ...details,
          message: 'No obvious security issues detected',
          checked: [
            'Environment variables exposure',
            'Console message leakage',
            'API keys in page source',
            'Security headers',
            'Browser storage',
          ],
        },
        duration_ms: duration,
      };
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      testName: 'Security Check',
      testType: 'SECURITY',
      status: TEST_RESULT_STATUS.FAILED,
      error_message: `Security test failed: ${error.message}`,
      error_category: ERROR_CATEGORY.UNKNOWN,
      url,
      details: { error: error.message },
      duration_ms: duration,
    };
  }
}
