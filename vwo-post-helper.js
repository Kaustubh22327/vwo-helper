(function () {
  console.log('[VWO Helper] 🟦 Script loaded successfully into window');
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

      if (!accountId || !eventName || !vwoUuid) {
        console.error('[VWO Helper] ❌ Missing required params.');
        return;
      }

      // Build endpoint
      let prefix = '';
      if (region === 'eu') prefix = 'eu01/';
      else if (region === 'in') prefix = 'as01/';
      const url =
        'https://dev.visualwebsiteoptimizer.com/' +
        prefix +
        'events/t?en=' +
        encodeURIComponent(eventName) +
        '&a=' +
        encodeURIComponent(accountId);

      // Build payload
      const timestampMs = Date.now();
      const timestampSec = Math.floor(timestampMs / 1000);
      const payload = {
        d: {
          msgId: vwoUuid + '-' + timestampMs,
          visId: vwoUuid,
          event: {
            name: eventName,
            time: timestampMs,
            props: {
              ...(properties || {}),
              isCustomEvent: true,
              vwoMeta: { source: 'gtm' },
            },
          },
          sessionId: timestampSec,
        },
      };

      console.log('[VWO Helper] 🌐 Final URL:', url);
      console.log('[VWO Helper] 📦 Payload:', payload);
      console.log('[VWO Helper] 🛰️ Sending POST request...');

      fetch(url, {
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

    // Attach to window & self
    if (typeof window !== 'undefined') window.vwoPostHelper = vwoPostHelper;
    if (typeof self !== 'undefined') self.vwoPostHelper = vwoPostHelper;

    console.log('[VWO Helper] ✅ vwoPostHelper attached to window and self.');
  } catch (e) {
    console.error('[VWO Helper] ❌ Exception while initializing helper:', e);
  }
})();
