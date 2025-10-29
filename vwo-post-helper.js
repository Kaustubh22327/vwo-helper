(function () {
  console.log('[VWO Helper] 🟦 Script loaded successfully into window');
  console.log('[VWO Helper] 🌍 Window object?', typeof window !== 'undefined');
  console.log('[VWO Helper] 🤖 Self object?', typeof self !== 'undefined');

  self.vwoSendEvent = window.vwoSendEvent = function (
    accountId,
    eventName,
    eventData,
    vwoUuid,
    region,
    properties
  ) {
    console.log('[VWO Helper] 🟢 vwoSendEvent called with:', {
      accountId,
      eventName,
      region,
      vwoUuid,
      eventData,
      properties,
    });

    if (!accountId || !eventName || !vwoUuid) {
      console.error('[VWO Helper] ❌ Missing required parameters.');
      return;
    }

    // --- Determine region endpoint prefix ---
    let prefix = '';
    if (region === 'eu') prefix = 'eu01/';
    else if (region === 'in') prefix = 'as01/';

    const endpoint = `https://dev.visualwebsiteoptimizer.com/${prefix}events/t?en=${encodeURIComponent(
      eventName
    )}&a=${encodeURIComponent(accountId)}`;

    // --- Build payload ---
    const timestampMs = Date.now();
    const timestampSec = Math.floor(timestampMs / 1000);

    const payload = {
      d: {
        msgId: `${vwoUuid}-${timestampMs}`,
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

    console.log('[VWO Helper] 🚀 Sending POST to:', endpoint);
    console.log('[VWO Helper] 🧾 Payload:', payload);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log('[VWO Helper] ✅ POST success:', res.status);
        console.log('[VWO Helper] 📦 Response body:', text);
      })
      .catch((err) => {
        console.error('[VWO Helper] ❌ POST failed:', err);
      });
  };

  console.log('[VWO Helper] ✅ vwoSendEvent attached to window and self.');
})();
