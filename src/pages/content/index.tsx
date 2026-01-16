import { startQuoteReply } from './quoteReply/index';
import { startTimeline } from './timeline/index';
import { startWatermarkRemover } from './watermarkRemover/index';

import { startFormulaCopy } from '@/features/formulaCopy';
import { initI18n } from '@/utils/i18n';




/**
 * Simple initialization for lightweight version with 4 core features
 */

// Initialization delay constants (in milliseconds)
const FEATURE_INIT_DELAY = 50;   // Small delay between feature initialization

let initialized = false;
let quoteReplyCleanup: (() => void) | null = null;

/**
 * Initialize the 4 core features
 */
async function initializeFeatures(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    console.log('[Gemini Voyager] Initializing lightweight version with 4 core features');

    if (location.hostname === 'gemini.google.com') {
      // Timeline Navigation
      startTimeline();
      await delay(FEATURE_INIT_DELAY);

      // Quote Reply
      quoteReplyCleanup = startQuoteReply();
      await delay(FEATURE_INIT_DELAY);

      // Watermark Remover - based on gemini-watermark-remover by journey-ad
      // https://github.com/journey-ad/gemini-watermark-remover
      startWatermarkRemover();
      await delay(FEATURE_INIT_DELAY);

      // Formula Copy
      startFormulaCopy();
    }
  } catch (e) {
    console.error('[Gemini Voyager] Initialization error:', e);
  }
}

// Main initialization logic
(function () {
  try {
    // Only run on gemini.google.com
    const hostname = location.hostname.toLowerCase();
    const isSupportedSite = hostname === 'gemini.google.com';

    if (!isSupportedSite) {
      console.log('[Gemini Voyager] Not gemini.google.com, skipping initialization');
      return;
    }

    // Initialize i18n early to ensure translations are available
    initI18n().catch(e => console.error('[Gemini Voyager] i18n init error:', e));

    // Initialize immediately
    initializeFeatures();

    // Setup cleanup on page unload to prevent memory leaks
    window.addEventListener('beforeunload', () => {
      try {
        if (quoteReplyCleanup) {
          quoteReplyCleanup();
          quoteReplyCleanup = null;
        }
      } catch (e) {
        console.error('[Gemini Voyager] Cleanup error:', e);
      }
    });

  } catch (e) {
    console.error('[Gemini Voyager] Fatal initialization error:', e);
  }
})();
