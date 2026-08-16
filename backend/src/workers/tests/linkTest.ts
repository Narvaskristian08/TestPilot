import { Page } from 'playwright';
import { TEST_RESULT_STATUS } from '../../config/constants';
import { discoverLinks, isSameDomain } from '../utils/discovery';
import { shouldCrawlUrl } from '../utils/safety';
import { TestResultData } from './availabilityTest';

/**
 * Test 3: Link Testing
 * Discover and test links on the page
 */
export async function runLinkTest(page: Page, baseUrl: string, maxLinks: number = 20): Promise<TestResultData> {
  const startTime = Date.now();
  
  try {
    const links = await discoverLinks(page);
    
    if (links.length === 0) {
      return {
        status: TEST_RESULT_STATUS.WARNING,
        error_message: 'No links found on page',
        details: {
          totalLinks: 0,
          testedLinks: 0,
        },
        duration_ms: Date.now() - startTime,
      };
    }

    // Filter links to same domain and safe URLs
    const sameDomainLinks = links.filter(link => 
      isSameDomain(link.href, baseUrl) && shouldCrawlUrl(link.href, baseUrl)
    );

    // Limit number of links to test
    const linksToTest = sameDomainLinks.slice(0, maxLinks);

    const results: Array<{
      url: string;
      text: string;
      status: number | null;
      success: boolean;
      error?: string;
    }> = [];

    let brokenLinks = 0;
    let workingLinks = 0;

    for (const link of linksToTest) {
      try {
        // Use HEAD request to check link without loading full page
        const response = await page.request.head(link.href, { timeout: 10000 });
        const status = response.status();
        
        if (status >= 200 && status < 400) {
          workingLinks++;
          results.push({
            url: link.href,
            text: link.text.substring(0, 50),
            status,
            success: true,
          });
        } else {
          brokenLinks++;
          results.push({
            url: link.href,
            text: link.text.substring(0, 50),
            status,
            success: false,
            error: `HTTP ${status}`,
          });
        }
      } catch (error: any) {
        brokenLinks++;
        results.push({
          url: link.href,
          text: link.text.substring(0, 50),
          status: null,
          success: false,
          error: error.message || 'Request failed',
        });
      }
    }

    const testStatus = brokenLinks === 0 
      ? TEST_RESULT_STATUS.PASSED 
      : brokenLinks < linksToTest.length / 2 
        ? TEST_RESULT_STATUS.WARNING 
        : TEST_RESULT_STATUS.FAILED;

    return {
      status: testStatus,
      error_message: brokenLinks > 0 ? `Found ${brokenLinks} broken link(s)` : undefined,
      details: {
        totalLinksFound: links.length,
        sameDomainLinks: sameDomainLinks.length,
        testedLinks: linksToTest.length,
        workingLinks,
        brokenLinks,
        results,
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message || 'Link test failed',
      details: {
        error: error.message,
      },
      duration_ms: Date.now() - startTime,
    };
  }
}
