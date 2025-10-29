/*******************************************************
 * VWO Helper Script (for GTM)
 * Handles POST requests to VWO Events API
 *******************************************************/

console.log('[VWO Helper] 🟦 Script loaded successfully into window');

// Basic environment checks
console.log('[VWO Helper] 🌍 Window object? ', typeof window !== 'undefined');
console.log('[VWO Helper] 🤖 Self object? ', typeof self !== 'undefined');

// Main POST helper function
function vwoPostHelper(accountId, eventName, properties, vwoUuid, region, meta) {
  console.log('[VWO Helper] 🚀 vwoPostHelper invoked with:', {
    accountId,
    eventName,
    properties,
    vwoUuid,
    region,
    meta
  });

  try {
    // --- Generate timestamps ---
    var timestampMs = Date.now();
    var timestampSec = Math.floor(timestampMs / 1000);

    // --- Build the payload ---
    var payload = {
      d: {
        msgId: vwoUuid + '-' + timestampMs,
        visId: vwoUuid,
        event: {
          name: eventName,
          time: timestampMs,
          props: {
            page: {
              title: document.title || '',
              url: window.location.href || '',
              referredUrl: document.referrer || ''
            },
            isCustomEvent: true,
            vwoMeta: meta || { source: 'gtm' }
          }
        },
        sessionId: timestampSec
      }
    };

    // --- Add any custom props passed ---
    if (properties && typeof properties === 'object') {
      for (var key in properties) {
        payload.d.event.props[key] = properties[key];
      }
    }

    // --- Build endpoint ---
    var prefix = '';
    if (region === 'eu') prefix = 'eu01/';
    else if (region === 'in') prefix = 'as01/';

    var endpoint =
      'https://dev.visualwebsiteoptimizer.com/' +
      prefix +
      'events/t?en=' +
      encodeURIComponent(eventName) +
      '&a=' +
      encodeURIComponent(accountId);

    console.log('[VWO Helper] 🚀 Sending POST to', endpoint);
    console.log('[VWO Helper] 🧾 Payload:', JSON.stringify(payload));

    // --- Perform POST request ---
    var xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        console.log('[VWO Helper] ✅ POST success:', xhr.status);
        console.log('[VWO Helper] 📦 Response Body:', xhr.responseText);
      }
    };

    xhr.onerror = function (err) {
      console.error('[VWO Helper] ❌ Network error:', err);
    };

    xhr.send(JSON.stringify(payload));
  } catch (e) {
    console.error('[VWO Helper] ❌ Exception inside vwoPostHelper:', e);
  }
}

// --- Attach to global scopes ---
try {
  window.vwoPostHelper = vwoPostHelper;
  self.vwoPostHelper = vwoPostHelper;
  console.log('[VWO Helper] ✅ vwoPostHelper attached to window and self.');
} catch (err) {
  console.error('[VWO Helper] ❌ Exception while initializing helper:', err);
}
