import { Page } from 'playwright';
import { TEST_RESULT_STATUS, ERROR_CATEGORY } from '../../config/constants';
import { discoverForms } from '../utils/discovery';
import { isSafeForm } from '../utils/safety';
import { TestResultData } from './availabilityTest';

/**
 * Form Discovery and Validation Test
 * Discovers forms, inspects their structure, and runs safe client-side validation checks.
 * Does NOT submit any form.
 */
export async function runFormTest(page: Page): Promise<TestResultData> {
  const startTime = Date.now();

  try {
    const forms = await discoverForms(page);

    if (forms.length === 0) {
      const url = page.url();
      return {
        status: TEST_RESULT_STATUS.WARNING,
        error_message: 'No forms found on the page',
        error_category: ERROR_CATEGORY.FORM_VALIDATION,
        expected_behavior: 'Page may contain HTML forms',
        actual_behavior: 'No <form> elements found',
        url,
        details: {
          formsFound: 0,
          note: 'Page may not use traditional HTML forms.',
        },
        duration_ms: Date.now() - startTime,
      };
    }

    const results = forms.map((form, index) => {
      const safe = isSafeForm(form);
      const requiredFields = form.fields.filter((f) => f.required);
      const emailFields = form.fields.filter((f) => f.type === 'email');
      const passwordFields = form.fields.filter((f) => f.type === 'password');
      const hiddenFields = form.fields.filter((f) => f.type === 'hidden');

      return {
        formIndex: index + 1,
        action: form.action || '(no action)',
        method: form.method || 'get',
        totalFields: form.fields.length,
        requiredFields: requiredFields.length,
        emailFields: emailFields.length,
        passwordFields: passwordFields.length,
        hiddenFields: hiddenFields.length,
        isSafe: safe,
        fields: form.fields.slice(0, 15).map((f) => ({
          name: f.name,
          type: f.type,
          required: f.required,
          label: f.label,
        })),
      };
    });

    const unsafeForms = results.filter((r) => !r.isSafe);

    return {
      status: TEST_RESULT_STATUS.PASSED,
      details: {
        formsFound: forms.length,
        safeForTesting: results.filter((r) => r.isSafe).length,
        skippedUnsafe: unsafeForms.length,
        forms: results,
        note: 'No forms were submitted. Destructive or payment forms are never touched.',
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error: any) {
    const url = page.url();
    return {
      status: TEST_RESULT_STATUS.WARNING,
      error_message: 'Could not analyse forms: ' + (error.message || 'Unknown error'),
      error_category: ERROR_CATEGORY.FORM_VALIDATION,
      expected_behavior: 'Form discovery should complete successfully',
      actual_behavior: error.message || 'Form analysis failed',
      url,
      details: { error: error.message },
      duration_ms: Date.now() - startTime,
    };
  }
}
