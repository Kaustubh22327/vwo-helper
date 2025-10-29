(function () {
  console.log('[VWO Helper] 🟦 Script loaded successfully');
  console.log('[VWO Helper] 🌍 window?', typeof window !== 'undefined');
  console.log('[VWO Helper] 🤖 self?', typeof self !== 'undefined');

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

      // Handle Run Test extra wrapper case
      const args = accountId && typeof accountId === 'object' ? accountId : {
        accountId,
        eventName,
        vwoUuid,
        region,
        properties,
      };

      const { accountId: acc, eventName: evt, vwoUuid: uuid, region: reg, properties: props } = args;

      if (!acc || !evt || !uuid) {
        console.error('[VWO Helper] ❌ Missing required params.');
        return;
      }

      // ✅ Build endpoint URL properly
      const baseUrl = reg === 'eu'
        ? 'https://dev.visualwebsiteoptimizer.com/eu01/events/t'
        : 'https://dev.visualwebsiteoptimizer.com/events/t';
      const finalUrl = `${baseUrl}?en=${encodeURIComponent(evt)}&a=${acc}`;

      // ✅ Construct payload
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

      console.log('[VWO Helper] 🌐 Final URL:', finalUrl);
      console.log('[VWO Helper] 📦 Payload:', JSON.stringify(payload, null, 2));

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

    // Attach to window/self
    if (typeof window !== 'undefined') window.vwoPostHelper = vwoPostHelper;
    if (typeof self !== 'undefined') self.vwoPostHelper = vwoPostHelper;
    console.log('[VWO Helper] ✅ Ready to receive GTM event calls.');
  } catch (e) {
    console.error('[VWO Helper] ❌ Exception while initializing helper:', e);
  }
})();
