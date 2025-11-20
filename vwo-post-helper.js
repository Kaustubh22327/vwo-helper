(function () {
  function vwoPushEvent(...args) {
    const [
      accountId,
      eventName,
      vwoUuid,
      region = '',
      properties = {}
    ] = args;

    if (!accountId || !eventName || !vwoUuid) {
      console.warn('[VWO Helper] Missing required fields:', { accountId, eventName, vwoUuid });
      return;
    }

    // Determine base URL
    let baseUrl = 'https://dev.visualwebsiteoptimizer.com/events/t';
    if (region === 'eu') {
      baseUrl = 'https://dev.visualwebsiteoptimizer.com/eu01/events/t';
    } else if (region === 'in') {
      baseUrl = 'https://dev.visualwebsiteoptimizer.com/as01/events/t';
    }

    const finalUrl = `${baseUrl}?en=${encodeURIComponent(eventName)}&a=${accountId}`;
    const now = Date.now();

    // Convert nested objects/arrays to string
    const cleanedProps = {};
    if (properties && typeof properties === 'object') {
      for (const key in properties) {
        const val = properties[key];
        if (val && typeof val === 'object') {
          cleanedProps[key] = JSON.stringify(val);
        } else {
          cleanedProps[key] = val;
        }
      }
    }

    // Build final payload EXACT format
    const payload = {
      d: {
        msgId: `${vwoUuid}-${now}`,
        visId: vwoUuid,
        event: {
          name: eventName,
          time: now,
          props: {
            ...cleanedProps,
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

    console.log('[VWO Helper] Payload:', payload);

    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload)
    }).catch((err) => {
      console.warn('[VWO Helper] POST request failed:', err);
    });
  }

  if (typeof window !== 'undefined') window.vwoPushEvent = vwoPushEvent;
  if (typeof self !== 'undefined') self.vwoPushEvent = vwoPushEvent;
})();
