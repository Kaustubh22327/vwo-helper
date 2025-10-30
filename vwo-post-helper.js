(function () {
  function vwoPostHelper(accountId, eventName, vwoUuid, region, properties, smartCodeEnabled, debugMode) {
    const log = (...args) => {
      if (debugMode) console.log(...args);
    };
    const error = (...args) => {
      if (debugMode) console.error(...args);
    };

    log('---------------------------------------------');
    log('[VWO Helper] 🚀 vwoPostHelper called with:', {
      accountId,
      eventName,
      vwoUuid,
      region,
      properties,
      smartCodeEnabled,
      debugMode,
    });

    const args = accountId && typeof accountId === 'object' ? accountId : {
      accountId,
      eventName,
      vwoUuid,
      region,
      properties,
      smartCodeEnabled,
      debugMode,
    };

    const { accountId: acc, eventName: evt, vwoUuid: uuid, region: reg, properties: props, smartCodeEnabled: smart } = args;

    // 🧩 SMART CODE MODE
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

    // 🧱 NORMAL MODE (direct POST)
    if (!acc || !evt || !uuid) {
      error('[VWO Helper] ❌ Missing required params.');
      return;
    }

    const baseUrl =
      reg === 'eu'
        ? 'https://dev.visualwebsiteoptimizer.com/eu01/events/t'
        : 'https://dev.visualwebsiteoptimizer.com/events/t';
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

    log('[VWO Helper] 🌐 Final URL:', finalUrl);
    log('[VWO Helper] 📦 Payload:', JSON.stringify(payload, null, 2));

    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        log('[VWO Helper] ✅ POST success:', res.status);
        log('[VWO Helper] 📦 Response Body:', text);
      })
      .catch((err) => {
        error('[VWO Helper] ❌ POST failed:', err);
      });
  }

  if (typeof window !== 'undefined') window.vwoPostHelper = vwoPostHelper;
  if (typeof self !== 'undefined') self.vwoPostHelper = vwoPostHelper;
})();
