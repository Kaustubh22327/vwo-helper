(function() {
  console.log('[VWO Helper] 🟦 Script loaded successfully into window');

  // Attach to both window and self (for GTM sandbox safety)
  self.vwoSendEvent = window.vwoSendEvent = function(accountId, eventName, eventData, vwoUuid, region, properties) {
    try {
      if (!accountId || !eventName || !vwoUuid) {
        console.error('[VWO Helper] ❌ Missing required params:', { accountId, eventName, vwoUuid });
        return;
      }

      // Determine region prefix
      let prefix = '';
      if (region === 'eu') prefix = 'eu01/';
      else if (region === 'in') prefix = 'as01/';

      const url = `https://dev.visualwebsiteoptimizer.com/${prefix}events/t?en=${encodeURIComponent(eventName)}&a=${encodeURIComponent(accountId)}`;

      // Construct payload
      const timestampMs = Date.now();
      const timestampSec = Math.floor(timestampMs / 1000);

      const body = {
        d: {
          msgId: vwoUuid + '-' + timestampMs,
          visId: vwoUuid,
          event: {
            name: eventName,
            time: timestampMs,
            props: {
              ...(eventData || {}),
              ...(properties || {}), // 🆕 merged user-specified properties
              isCustomEvent: true,
              vwoMeta: { source: 'gtm' },
            },
          },
          sessionId: timestampSec,
        },
      };

      console.log('[VWO Helper] 🚀 Sending POST to:', url);
      console.log('[VWO Helper] 🧾 Payload:', body);

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(body),
      })
        .then(async (res) => {
          const text = await res.text();
          console.log('[VWO Helper] ✅ POST success:', res.status);
          console.log('[VWO Helper] 📦 Response Body:', text);
        })
        .catch((err) => {
          console.error('[VWO Helper] ❌ POST failed:', err);
        });
    } catch (e) {
      console.error('[VWO Helper] ❌ Exception:', e);
    }
  };
})();
