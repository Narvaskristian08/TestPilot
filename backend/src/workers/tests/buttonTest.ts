import { Page } from 'playwright';
import { TEST_RESULT_STATUS } from '../../config/constants';
import { discoverButtons } from '../utils/discovery';
import { isDestructiveAction } from '../utils/safety';
import { TestResultData } from './availabilityTest';

/**
 * Button Discovery and Safety Test
 * Discovers all visible buttons on the page and categorises them.
 * Does NOT click buttons - only inspects them.
 */
export async function runButtonTest(page: Page): Promise<TestResultData> {
  const startTime = Date.now();

  try {
    const buttons = await discoverButtons(page);

    const safe: Array<{ text: string; type: string }> = [];
    const destructive: Array<{ text: string; type: string }> = [];

    for (const btn of buttons) {
      if (isDestructiveAction(btn.text)) {
        destructive.push({ text: btn.text, type: btn.type });
      } else {
        safe.push({ text: btn.text, type: btn.type });
      }
    }

    return {
      status: TEST_RESULT_STATUS.PASSED,
      details: {
        totalButtonsFound: buttons.length,
        safeButtons: safe.length,
        destructiveButtons: destructive.length,
        safe: safe.slice(0, 20),
        destructive: destructive.slice(0, 10),
        note: 'No buttons were clicked. Destructive actions are never triggered automatically.',
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: TEST_RESULT_STATUS.WARNING,
      error_message: 'Could not analyse buttons: ' + (error.message || 'Unknown error'),
      details: { error: error.message },
      duration_ms: Date.now() - startTime,
    };
  }
}
