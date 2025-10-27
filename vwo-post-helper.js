// vwo-post-helper.js
window.vwoPostHelper = function (url, body) {
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(body)
    })
      .then((res) => {
        console.log('[VWO Helper] ✅ POST success:', res.status);
      })
      .catch((err) => {
        console.error('[VWO Helper] ❌ POST failed:', err);
      });
  } catch (e) {
    console.error('[VWO Helper] ❌ Exception:', e);
  }
};
