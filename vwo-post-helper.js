// vwo-post-helper.js (attach to top window for maximum visibility)
(function() {
  try {
    console.log('[VWO Helper] 🟦 Script loaded successfully into window');

    var root = (typeof window !== 'undefined' && window.top) ? window.top : window;
    try { if (!root) root = window; } catch (e) { root = window; }

    function sendPost(url, body) {
      try {
        console.log('[VWO Helper] 🚀 Sending POST to', url);
        console.log('[VWO Helper] 🧾 Payload:', body);
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          body: JSON.stringify(body)
        })
        .then(function(res){ return res.text().then(function(text){ console.log('[VWO Helper] ✅ POST success:', res.status); console.log('[VWO Helper] 📦 Response Body:', text); }); })
        .catch(function(err){ console.error('[VWO Helper] ❌ POST failed:', err); });
      } catch (e) {
        console.error('[VWO Helper] ❌ Exception in fetch:', e);
      }
    }

    // Attach safely to multiple possible root objects
    try { root.vwoPostHelper = sendPost; } catch (e) { /* ignore */ }
    try { window.vwoPostHelper = sendPost; } catch (e) { /* ignore */ }
    try { self.vwoPostHelper = sendPost; } catch (e) { /* ignore */ }

    console.log('[VWO Helper] ✅ vwoPostHelper attached. root typeof:', (typeof root.vwoPostHelper));
    console.log('[VWO Helper] 🕵️ Check: typeof window.vwoPostHelper =', (typeof window.vwoPostHelper));
    console.log('[VWO Helper] 🏁 Ready to receive calls.');
  } catch (e) {
    console.error('[VWO Helper] ❌ Exception while initializing helper:', e);
  }
})();
