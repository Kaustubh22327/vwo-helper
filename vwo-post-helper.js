/**
 * VWO Push Helper Script
 * -------------------------------------------------------
 * Sends events directly to VWO collector when SmartCode mode is OFF.
 * Exposed globally as: window.vwoPushEvent()
 */

(function () {
  function vwoPostHelper(...args) {
    // Destructure expected args with defaults
    const [
      accountId,
      eventName,
      vwoUuid,
      region = '',
      properties = {}
    ] = args;

    // Validate required fields
    if (!accountId || !eventName || !vwoUuid) {
      console.warn('[VWO Helper] Missing required fields:', { accountId, eventName, vwoUuid });
      return;
    }

    // Determine base URL based on region
    let baseUrl = 'https://dev.visualwebsiteoptimizer.com/events/t';
    if (region === 'eu') {
      baseUrl = 'https://dev.visualwebsiteoptimizer.com/eu01/events/t';
    } else if (region === 'in') {
      baseUrl = 'https://dev.visualwebsiteoptimizer.com/as01/events/t';
    }

    const finalUrl = `${baseUrl}?en=${encodeURIComponent(eventName)}&a=${accountId}`;
    const now = Date.now();

    // Build payload
    const payload = {
      d: {
        msgId: `${vwoUuid}-${now}`,
        visId: vwoUuid,
        event: {
          name: eventName,
          time: now,
          props: {
            ...(properties || {}),
            page: {
              title: document.title,
              url: location.href,
              referredUrl: document.referrer
            },
            isCustomEvent: true,
            vwoMeta: { source: 'gtm' }
          }
        },
        sessionId: Math.floor(now / 1000)
      }
    };

    // Send POST request
    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload)
    }).catch((err) => {
      console.warn('[VWO Helper] POST request failed:', err);
    });
  }

  // Expose globally
  if (typeof window !== 'undefined') window.vwoPostHelper = vwoPostHelper;
  if (typeof self !== 'undefined') self.vwoPostHelper = vwoPostHelper;
})();
