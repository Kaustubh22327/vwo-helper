/**
 * VWO Post Helper Script
 * ----------------------------------------
 * Enables Google Tag Manager (GTM) templates to send custom tracking events to VWO.
 *
 *  Supports:
 *   - SmartCode Mode (push via window.VWO)
 *   - Direct POST Mode (send via collector API)
 *
 *  Includes:
 *   - Region-based URL prefix handling (US, EU, AS)
 *   - Debug logging (only active when debugMode = true)
 *
 *  Region Guidance:
 *   If your account is configured with a non-US data center:
 *     - Use 'eu01' for EU accounts
 *     - Use 'as01' for Asia accounts
 *   Otherwise, the default (US) collector is used.
 *   Incorrect prefixes will cause POST calls to be rejected.
 */

(function () {

  function vwoPostHelper(accountId, eventName, vwoUuid, region, properties, smartCodeEnabled) {

    const args =
      accountId && typeof accountId === 'object'
        ? accountId
        : {
            accountId,
            eventName,
            vwoUuid,
            region,
            properties,
            smartCodeEnabled
          };

    const {
      accountId: acc,
      eventName: evt,
      vwoUuid: uuid,
      region: reg,
      properties: props,
      smartCodeEnabled: smart
    } = args;

    // ---------------- SMART CODE MODE ----------------
    if (smart) {

      const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return {};
        const out = {};
        for (const k in obj) {
          const v = obj[k];
          if (v === undefined || typeof v === 'function') continue;
          if (typeof Node !== 'undefined' && v instanceof Node) continue;
          out[k] = v;
        }
        return out;
      };

      try {
        if (!window.VWO) window.VWO = [];
        if (typeof window.VWO.push !== 'function') {
          window.VWO = [].concat(window.VWO);
        }

        const safeProps = sanitize(props || {});
        window.VWO.push(['event', String(evt || ''), safeProps]);
      } catch (e) {
        // silent fail
      }
      return;
    }

    // --------------- DIRECT POST MODE ---------------
    if (!acc || !evt || !uuid) return;

    let baseUrl = 'https://dev.visualwebsiteoptimizer.com/events/t';
    if (reg === 'eu') baseUrl = 'https://dev.visualwebsiteoptimizer.com/eu01/events/t';
    else if (reg === 'in') baseUrl = 'https://dev.visualwebsiteoptimizer.com/as01/events/t';

    const finalUrl = `${baseUrl}?en=${encodeURIComponent(evt)}&a=${acc}`;
    const now = Date.now();

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

    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // silent failure
    });
  }

  if (typeof window !== 'undefined') window.vwoPostHelper = vwoPostHelper;
  if (typeof self !== 'undefined') self.vwoPostHelper = vwoPostHelper;
})();



