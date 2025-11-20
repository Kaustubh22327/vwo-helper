/**
* VWO Push Helper Script
* -------------------------------------------------------
* Sends events directly to VWO collector when SmartCode mode is OFF.
* Exposed globally as: window.vwoPushEvent()
*/
(function () {
  function vwoPushEvent(...args) {
    let [
      accountId,
      eventName,
      vwoUuid,
      region = '',
      properties = {}
    ] = args;

    // ---- Normalize properties ----
    try {
      // If properties is a string → parse it
      if (typeof properties === "string") {
        properties = JSON.parse(properties);
      }

      // If properties is an array like:
      // [ { property_name: 'price', property_value: 700 }, ... ]
      if (Array.isArray(properties)) {
        const formatted = {};
        properties.forEach(item => {
          if (
            item &&
            typeof item === "object" &&
            "property_name" in item &&
            "property_value" in item
          ) {
            formatted[item.property_name] = item.property_value;
          }
        });
        properties = formatted;
      }

      // If still an object → stringify nested objects/arrays
      else if (properties && typeof properties === "object") {
        Object.keys(properties).forEach(key => {
          const val = properties[key];
          if (val && (typeof val === "object" || Array.isArray(val))) {
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

    // Build payload EXACTLY like required
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
              referrerUrl: document.referrer
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
