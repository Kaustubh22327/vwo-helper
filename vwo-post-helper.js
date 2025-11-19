(function () {

  function vwoPushEvent(args) {
    if (!args) args = {};

    var acc  = args.accountId;
    var evt  = args.eventName;
    var uuid = args.vwoUuid;
    var reg  = args.region;
    var props = args.properties || {};

    if (!acc || !evt || !uuid) {
      console.error('VWO Push Error: Missing required parameters');
      return;
    }

    // Build endpoint URL
    var baseUrl = 'https://dev.visualwebsiteoptimizer.com/events/t';
    if (reg === 'eu') baseUrl = 'https://dev.visualwebsiteoptimizer.com/eu01/events/t';
    else if (reg === 'in') baseUrl = 'https://dev.visualwebsiteoptimizer.com/as01/events/t';

    var finalUrl = baseUrl + '?en=' + encodeURIComponent(evt) + '&a=' + acc;
    var now = Date.now();

    // Merge props manually
    var eventProps = {};

    // copy user props
    for (var key in props) {
      if (props.hasOwnProperty(key)) {
        eventProps[key] = props[key];
      }
    }

    // add page details
    eventProps.page = {
      title: document.title,
      url: location.href,
      referredUrl: document.referrer
    };

    eventProps.isCustomEvent = true;
    eventProps.vwoMeta = { source: 'gtm' };

    // Payload
    var payload = {
      d: {
        msgId: uuid + '-' + now,
        visId: uuid,
        event: {
          name: evt,
          time: now,
          props: eventProps
        },
        sessionId: now / 1000
      }
    };

    // Fire POST request
    fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(payload)
    }).catch(function (e) {
      console.error('VWO Direct Push Error:', e);
    });
  }

  if (typeof window !== 'undefined') window.vwoPushEvent = vwoPushEvent;
  if (typeof self !== 'undefined') self.vwoPushEvent = vwoPushEvent;

})();
