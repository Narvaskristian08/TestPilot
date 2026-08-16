import { DESTRUCTIVE_KEYWORDS } from '../../config/constants';

/**
 * Check if button text contains destructive keywords
 */
export function isDestructiveAction(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  return DESTRUCTIVE_KEYWORDS.some(keyword => 
    lowerText.includes(keyword)
  );
}

/**
 * Check if form is likely to be safe to test
 */
export function isSafeForm(form: {
  action: string;
  method: string;
  fields: Array<{ name: string; type: string; required: boolean; label: string }>;
}): boolean {
  const lowerAction = form.action.toLowerCase();
  
  // Avoid payment, checkout, purchase forms
  const dangerousPatterns = [
    'payment',
    'checkout',
    'purchase',
    'buy',
    'order',
    'billing',
    'credit-card',
    'subscribe',
  ];
  
  if (dangerousPatterns.some(pattern => lowerAction.includes(pattern))) {
    return false;
  }
  
  // Check for password fields (might be login/signup forms - handle with care)
  const hasPasswordField = form.fields.some(field => field.type === 'password');
  
  // Check for credit card fields
  const hasCreditCardField = form.fields.some(field => 
    field.name.toLowerCase().includes('card') || 
    field.name.toLowerCase().includes('ccn') ||
    field.name.toLowerCase().includes('cvv')
  );
  
  if (hasCreditCardField) {
    return false;
  }
  
  // Contact forms, newsletter forms are generally safe
  return true;
}

/**
 * Check if URL should be crawled
 */
export function shouldCrawlUrl(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    // Only crawl same domain
    if (urlObj.hostname !== baseUrlObj.hostname) {
      return false;
    }
    
    // Avoid common file downloads
    const fileExtensions = [
      '.pdf', '.zip', '.exe', '.dmg', '.pkg',
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.avi',
    ];
    
    const pathname = urlObj.pathname.toLowerCase();
    if (fileExtensions.some(ext => pathname.endsWith(ext))) {
      return false;
    }
    
    // Avoid mailto, tel, javascript links
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize text for safe display
 */
export function sanitizeText(text: string, maxLength: number = 200): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, maxLength)
    .trim();
}
