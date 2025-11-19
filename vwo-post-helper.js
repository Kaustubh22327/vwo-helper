/**
 * VWO Push Helper Script
 * -------------------------------------------------------
 * Sends events directly to VWO collector when SmartCode mode is OFF.
 * Exposed globally as: window.vwoPushEvent()
 */

(function () {

  function vwoPushEvent(args = {}) {

    const {
      accountId: acc,
      eventName: evt,
      vwoUuid: uuid,
      region: reg,
      properties: props
    } = args;

    if (!acc || !evt || !uuid) {
      console.error('VWO Push Error: Missing required parameters');
      return;
    }

    // --------------- Build Endpoint URL ---------------
    let baseUrl = 'https://dev.visualwebsiteoptimizer.com/events/t';
    if (reg === 'eu') baseUrl = 'https://dev.visualwebsiteoptimizer.com/eu01/events/t';
    else if (reg === 'in') baseUrl = 'https://dev.visualwebsiteoptimizer.com/as01/events/t';

    const finalUrl = `${baseUrl}?en=${encodeURIComponent(evt)}&a=${acc}`;
    const now = Date.now();

    // ---------------- Request Payload -----------------
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
            vwoMeta: { source: 'gtm' }
          }
        },
        sessionId: now / 1000
      }
    };

    // ----------------- Fire POST ----------------------
    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload)
    }).catch((e) => {
      console.error('VWO Direct Push Error:', e);
    });
  }

  // Global exposure
  if (typeof window !== 'undefined') window.vwoPushEvent = vwoPushEvent;
  if (typeof self !== 'undefined') self.vwoPushEvent = vwoPushEvent;

})();
