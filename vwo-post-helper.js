/**
 * VWO Post Helper Script
 * ----------------------------------------
 * Enables Google Tag Manager (GTM) templates to send custom tracking events to VWO.
 *
 * ✅ Supports:
 *   1️⃣ SmartCode Mode (push via window.VWO)
 *   2️⃣ Direct POST Mode (send via collector API)
 *
 * ⚙️ Includes:
 *   - Region-based URL prefix handling (US, EU, IN)
 *   - Debug logging (only active when debugMode = true)
 *
 * 📘 Region Guidance:
 *   If your account is configured with a non-US data center:
 *     - Use 'eu01' for EU accounts
 *     - Use 'as01' for India accounts
 *   Otherwise, the default (US) collector is used.
 *   Incorrect prefixes will cause POST calls to be rejected.
 */

(function () {
  /**
   * Main entry function invoked by GTM.
   *
   * @param {string} accountId         - VWO Account ID
   * @param {string} eventName         - Custom event name
   * @param {string} vwoUuid           - VWO UUID (visitor ID)
   * @param {string} region            - 'eu' (Europe), 'in' (India), or '' (US)
   * @param {object} properties        - Additional event properties
   * @param {boolean} smartCodeEnabled - Enables SmartCode mode if true
   * @param {boolean} debugMode        - Enables debug logs if true
   */
  function vwoPostHelper(accountId, eventName, vwoUuid, region, properties, smartCodeEnabled, debugMode) {
    // --- Conditional logging (only active when debugMode is true) ---
    const log = (...args) => {
      if (debugMode) console.log(...args);
    };
    const error = (...args) => {
      if (debugMode) console.error(...args);
    };

    log('---------------------------------------------');
    log('[VWO Helper] vwoPostHelper called with:', {
      accountId,
      eventName,
      vwoUuid,
      region,
      properties,
      smartCodeEnabled,
      debugMode,
    });

    // Support both direct argument and object invocation
    const args =
      accountId && typeof accountId === 'object'
        ? accountId
        : {
            accountId,
            eventName,
            vwoUuid,
            region,
            properties,
            smartCodeEnabled,
            debugMode,
          };

    const {
      accountId: acc,
      eventName: evt,
      vwoUuid: uuid,
      region: reg,
      properties: props,
      smartCodeEnabled: smart,
    } = args;

    // --- Mode 1: SmartCode push ---
    if (smart) {
      log('[VWO Helper] ⚡ Smart Code mode ENABLED — pushing via window.VWO');

      if (window.VWO && typeof window.VWO.push === 'function') {
        window.VWO.push(['event', evt, props || {}, { source: 'gtm', via: 'smartCode' }]);
        log('[VWO Helper] ✅ Event pushed via Smart Code:', evt);
      } else {
        error('[VWO Helper] ❌ window.VWO not found or invalid.');
      }
      return;
    }

    // --- Mode 2: Direct POST mode ---
    if (!acc || !evt || !uuid) {
      error('[VWO Helper] ❌ Missing required params.');
      return;
    }

    /**
     * Determine correct collector URL based on region.
     * -----------------------------------------------
     *  US (default): https://dev.visualwebsiteoptimizer.com/events/t
     *  EU:           https://dev.visualwebsiteoptimizer.com/eu01/events/t
     *  IN:           https://dev.visualwebsiteoptimizer.com/as01/events/t
     */
    let baseUrl = 'https://dev.visualwebsiteoptimizer.com/events/t';
    if (reg === 'eu') baseUrl = 'https://dev.visualwebsiteoptimizer.com/eu01/events/t';
    else if (reg === 'in') baseUrl = 'https://dev.visualwebsiteoptimizer.com/as01/events/t';

    const finalUrl = `${baseUrl}?en=${encodeURIComponent(evt)}&a=${acc}`;
    const now = Date.now();

    // Build event payload following VWO schema
    const payload = {
      d: {
        msgId: `${uuid}-${now}`,
        visId: uuid,
        event: {
          name: evt,
          time: now,
          props: {
            ...props,
            page: {
              title: document.title,
              url: location.href,
              referredUrl: document.referrer,
            },
            isCustomEvent: true,
            vwoMeta: { source: 'gtm' },
          },
        },
        sessionId: now / 1000,
      },
    };

    log('[VWO Helper] Final URL:', finalUrl);
    log('[VWO Helper] Payload:', JSON.stringify(payload, null, 2));

    // Send POST request
    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        log('[VWO Helper] ✅ POST success:', res.status);
        log('[VWO Helper] Response Body:', text);
      })
      .catch((err) => {
        error('[VWO Helper] ❌ POST failed:', err);
      });
  }

  // --- Global exposure for GTM templates ---
  if (typeof window !== 'undefined') window.vwoPostHelper = vwoPostHelper;
  if (typeof self !== 'undefined') self.vwoPostHelper = vwoPostHelper;
})();
