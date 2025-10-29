(function () {
  console.log('[VWO Helper] 🟦 Script loaded successfully into window');
  console.log('[VWO Helper] 🌍 Window object?', typeof window !== 'undefined');
  console.log('[VWO Helper] 🤖 Self object?', typeof self !== 'undefined');

  try {
    function vwoPostHelper(accountId, eventName, vwoUuid, region, properties) {
      console.log('---------------------------------------------');
      console.log('[VWO Helper] 🚀 vwoPostHelper called with:', {
        accountId,
        eventName,
        vwoUuid,
        region,
        properties,
      });

      // Basic validation
      if (!accountId || !eventName || !vwoUuid) {
        console.error('[VWO Helper] ❌ Missing required params.');
        return;
      }

      // ✅ Construct final POST URL
      const baseUrl = region === 'eu'
        ? 'https://dev.visualwebsiteoptimizer.com/eu01/events/t'
        : 'https://dev.visualwebsiteoptimizer.com/events/t';
      const finalUrl = `${baseUrl}?en=${encodeURIComponent(eventName)}&a=${accountId}`;

      // ✅ Construct payload
      const now = Date.now();
      const payload = {
        d: {
          msgId: `${vwoUuid}-${now}`,
          visId: vwoUuid,
          event: {
            name: eventName,
            time: now,
            props: {
              ...properties,
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

      console.log('[VWO Helper] 📦 Final payload:', JSON.stringify(payload, null, 2));
      console.log('[VWO Helper] 🌐 Sending POST to:', finalUrl);

      fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const text = await res.text();
          console.log('[VWO Helper] ✅ POST success:', res.status);
          console.log('[VWO Helper] 📦 Response Body:', text);
        })
        .catch((err) => {
          console.error('[VWO Helper] ❌ POST failed:', err);
        });
    }

    // Attach to both window and self
    if (typeof window !== 'undefined') {
      window.vwoPostHelper = vwoPostHelper;
      console.log('[VWO Helper] 🧠 Attached to window');
    }
    if (typeof self !== 'undefined') {
      self.vwoPostHelper = vwoPostHelper;
      console.log('[VWO Helper] 🧠 Attached to self');
    }

    console.log('[VWO Helper] ✅ Ready to receive GTM event calls.');
  } catch (e) {
    console.error('[VWO Helper] ❌ Exception while initializing helper:', e);
  }
})();
