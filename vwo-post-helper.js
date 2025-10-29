(function() {
  console.log('[VWO Helper] 🟦 Script loaded successfully into window');
  console.log('[VWO Helper] 🌍 Window object available?', typeof window !== 'undefined');
  console.log('[VWO Helper] 🤖 Self object available?', typeof self !== 'undefined');

  // Wrap everything in try/catch for visibility
  try {
    // Attach helper to both window and self for GTM sandbox safety
    self.vwoSendEvent = window.vwoSendEvent = function(accountId, eventName, eventData, vwoUuid, region, properties) {
      console.log('[VWO Helper] 🧩 vwoSendEvent called with params:', {
        accountId, eventName, eventData, vwoUuid, region, properties
      });

      try {
        // Validate inputs
        if (!accountId || !eventName || !vwoUuid) {
          console.error('[VWO Helper] ❌ Missing required parameters:', { accountId, eventName, vwoUuid });
          return;
        }

        // Determine region prefix
        let prefix = '';
        if (region === 'eu') prefix = 'eu01/';
        else if (region === 'in') prefix = 'as01/';

        const url = `https://dev.visualwebsiteoptimizer.com/${prefix}events/t?en=${encodeURIComponent(eventName)}&a=${encodeURIComponent(accountId)}`;
        console.log('[VWO Helper] 🌐 Constructed URL:', url);

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
                ...(properties || {}),
                isCustomEvent: true,
                vwoMeta: { source: 'gtm' },
              },
            },
            sessionId: timestampSec,
          },
        };

        console.log('[VWO Helper] 🧾 Final Payload:', JSON.stringify(body, null, 2));

        // Fire POST request
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          body: JSON.stringify(body),
        })
          .then(async (res) => {
            const text = await res.text();
            console.log('[VWO Helper] ✅ POST success. Status:', res.status);
            console.log('[VWO Helper] 📦 Response Body:', text);
          })
          .catch((err) => {
            console.error('[VWO Helper] ❌ POST failed. Error:', err);
          });
      } catch (err) {
        console.error('[VWO Helper] ❌ Exception in vwoSendEvent:', err);
      }
    };

    console.log('[VWO Helper] ✅ vwoSendEvent successfully attached to window and self.');
    console.log('[VWO Helper] 🕵️ Check: typeof window.vwoSendEvent =', typeof window.vwoSendEvent);
    console.log('[VWO Helper] 🕵️ Check: typeof self.vwoSendEvent =', typeof self.vwoSendEvent);
    console.log('[VWO Helper] 🏁 Ready to receive GTM event calls.');

  } catch (e) {
    console.error('[VWO Helper] ❌ Exception while defining helper:', e);
  }
})();
