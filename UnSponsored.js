(function () {
  'use strict';

  const api = typeof browser !== 'undefined' ? browser : chrome;

  const SITE_SELECTORS = {
    'google': [
      '[data-text-ad="1"]',
      '[data-is-ad="1"]',
      '#tads',
      '#bottomads',
      'div[aria-label="Ads"]',
      'div[aria-label="Anzeigen"]'
    ],
    'mobile.de': [
      '[data-testid*="sponsored" i]',
      '[data-testid*="-ad-" i]',
      '[data-testid$="-ad"]',
      '[class*="sponsored" i]',
      '[class*="-ad-"]',
      '.cBox-body--vehicleSponsoredHits',
      '.cBox-body--resultListSponsoredHits',
      '.dsp-cBox',
      '#srp-top-ad',
      '#srp-bottom-ad'
    ],
    'ecosia.org': [
      '.mainline__result--ad',
      '.result--ad',
      '[data-test-id*="ad" i][data-test-id*="result" i]',
      '[class*="result--ad"]',
      '[class*="-ad-result"]',
      '.card-ad',
      '.card-ad-mainline'
    ]
  };

  function getSiteKey() {
    const host = location.hostname;
    if (host.endsWith('.google.com') || host.endsWith('.google.co.uk') || host.endsWith('.google.de')) {
      return 'google';
    }
    if (host.endsWith('mobile.de')) {
      return 'mobile.de';
    }
    if (host.endsWith('ecosia.org')) {
      return 'ecosia.org';
    }
    return null;
  }

  const STYLE_ID = 'unsponsored-hide-style';

  function buildHideStyle(selectors) {
    return selectors.join(',\n') + ' { display: none !important; }';
  }

  function applyHiding(selectors) {
    let style = document.getElementById(STYLE_ID);
    const css = buildHideStyle(selectors);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    } else {
      style.textContent = css;
    }
  }

  function removeHiding() {
    const style = document.getElementById(STYLE_ID);
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }

  const siteKey = getSiteKey();
  if (!siteKey) {
    return;
  }
  const selectors = SITE_SELECTORS[siteKey];

  api.storage.sync.get('enabled', function (data) {
    const isEnabled = data.enabled === undefined ? true : data.enabled;
    if (isEnabled) {
      applyHiding(selectors);
    }
  });

  api.runtime.onMessage.addListener(function (request) {
    if (!request || typeof request.enabled !== 'boolean') {
      return;
    }
    if (request.enabled) {
      applyHiding(selectors);
    } else {
      removeHiding();
    }
  });
})();
