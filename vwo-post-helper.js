// vwo-post-helper.js
(function() {
  console.log('[VWO Helper] 🟦 Script loaded successfully into window');

  // Attach to both window and self (for GTM sandbox safety)
  self.vwoPostHelper = window.vwoPostHelper = function(url, body) {
    try {
      console.log('[VWO Helper] 🚀 Sending POST to', url);
      console.log('[VWO Helper] 🧾 Payload:', body);

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(body)
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

