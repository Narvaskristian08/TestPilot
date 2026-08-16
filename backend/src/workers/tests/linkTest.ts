import { Page } from 'playwright';
import { TEST_RESULT_STATUS, ERROR_CATEGORY } from '../../config/constants';
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
      const url = page.url();
      return {
        status: TEST_RESULT_STATUS.WARNING,
        error_message: 'No links found on page',
        error_category: ERROR_CATEGORY.NAVIGATION,
        expected_behavior: 'Page should contain clickable links (<a> tags with href)',
        actual_behavior: 'No links found on the page',
        url,
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

    const firstBrokenLink = results.find(r => !r.success);

    return {
      status: testStatus,
      error_message: brokenLinks > 0 ? `Found ${brokenLinks} broken link(s)` : undefined,
      error_category: brokenLinks > 0 ? ERROR_CATEGORY.BROKEN_LINK : undefined,
      expected_behavior: brokenLinks > 0 ? 'All links should return HTTP 200-399 (successful response)' : undefined,
      actual_behavior: brokenLinks > 0 && firstBrokenLink ? `Link "${firstBrokenLink.url}" returned ${firstBrokenLink.error || 'error'}` : undefined,
      url: firstBrokenLink?.url,
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
    const url = page.url();
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message || 'Link test failed',
      error_category: ERROR_CATEGORY.UNKNOWN,
      expected_behavior: 'Link discovery and testing should complete successfully',
      actual_behavior: error.message || 'Link test failed',
      url,
      details: {
        error: error.message,
      },
      duration_ms: Date.now() - startTime,
    };
  }
}
