/**
* VWO Push Helper Script
* -------------------------------------------------------
* Sends events directly to VWO collector when SmartCode mode is OFF.
* Exposed globally as: window.vwoPushEvent()
*
* IMPORTANT FIX: Removed the IIFE wrapper to allow GTM's copyFromWindow to access it.
*/

// Define the function using 'var' or 'window/self' directly 
// to ensure it's on the global scope of the injected script's context.

var vwoPushEvent = function vwoPushEvent(...args) {
    let [
      accountId,
      eventName,
      vwoVisitorId,
      region = '',
      properties = {}
    ] = args;

    // ---- Parse JSON string from GTM ----
    try {
      // If properties is a string → parse it
      if (typeof properties === "string") {
        properties = JSON.parse(properties);
      }

      // Now properties should be an object like: {price: "700", custom: {...}}
      // Stringify only nested objects/arrays for VWO collector requirement
      if (properties && typeof properties === "object" && !Array.isArray(properties)) {
        Object.keys(properties).forEach(key => {
          const val = properties[key];
          // Stringify if value is object or array
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
    if (!accountId || !eventName || !vwoVisitorId) {
      console.warn('[VWO Helper] Missing required fields:', { accountId, eventName, vwoVisitorId });
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
        msgId: `${vwoVisitorId}-${now}`,
        visId: vwoVisitorId,
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
};

// Ensure it is explicitly attached to the global object if necessary,
// although using 'var' at the top level should suffice in this context.
if (typeof window !== 'undefined') window.vwoPushEvent = vwoPushEvent;
if (typeof self !== 'undefined') self.vwoPushEvent = vwoPushEvent;
