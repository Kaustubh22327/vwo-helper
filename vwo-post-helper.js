/**
 * VWO Push Helper Script
 * -------------------------------------------------------
 * Sends events directly to VWO collector when SmartCode mode is OFF.
 * Exposed globally as: window.vwoPushEvent()
 */
(function () {
  function vwoPushEvent(...args) {
    const [
      accountId,
      eventName,
      vwoUuid,
      region = '',
      properties = {}
    ] = args;

    // ---- Normalize properties ----
    try {
      // If properties is a string, parse it
      if (typeof properties === "string") {
        properties = JSON.parse(properties);
      }

      // If still object → iterate and stringify nested objects
      if (properties && typeof properties === "object") {
        Object.keys(properties).forEach(key => {
          const val = properties[key];
          if (val && typeof val === "object") {
            properties[key] = JSON.stringify(val);
          }
        });
      } else {
        properties = {};
      }
    } catch (e) {
      console.warn("[VWO Helper] Failed to process properties:", e);
      properties = {};
    }

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

    console.log("[VWO Helper] Final Payload:", payload);

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
  if (typeof window !== 'undefined') window.vwoPushEvent = vwoPushEvent;
  if (typeof self !== 'undefined') self.vwoPushEvent = vwoPushEvent;
})();
