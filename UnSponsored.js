(function () {
  'use strict';

  const api = typeof browser !== 'undefined' ? browser : chrome;

  const SITE_CONFIG = {
    'google': {
      hideSelectors: [
        '[data-text-ad="1"]',
        '[data-is-ad="1"]',
        '#tads',
        '#bottomads',
        'div[aria-label="Ads"]',
        'div[aria-label="Anzeigen"]'
      ]
    },
    'mobile.de': {
      hideSelectors: [
        '.cBox-body--vehicleSponsoredHits',
        '.cBox-body--resultListSponsoredHits',
        '.dsp-cBox',
        '#srp-top-ad',
        '#srp-bottom-ad'
      ],
      markerSelectors: [
        '[data-testid*="sponsored" i]',
        '[data-testid*="top-in-category" i]',
        '[data-testid*="topInCategory" i]',
        '[data-testid*="TopInCategory" i]',
        '[data-testid*="ad-result" i]',
        '[class*="TopInCategory"]',
        '[class*="top-in-category"]',
        '[class*="topInCategory"]',
        '[class*="SponsoredLabel"]',
        '[class*="sponsored-label"]',
        '[class*="sponsoredHit"]',
        '[class*="ad-label"]',
        '[class*="AdLabel"]'
      ],
      markerTextRegex: /^\s*(anzeige|sponsored|top in der kategorie|top in category)\s*$/i,
      cardSelector: [
        'article',
        '[data-testid="result-item"]',
        '[data-testid*="result-item" i]',
        '[data-testid^="srpResultItemContainer"]',
        '[data-testid*="srpResultItem" i]',
        '[data-listing-id]',
        'li[class*="result-list-item"]',
        'li.cBox-body',
        '[class*="ResultItem"]',
        '[class*="result-item"]'
      ].join(', ')
    },
    'ecosia.org': {
      hideSelectors: [
        '.mainline__result--ad',
        '.result--ad',
        '[class*="result--ad"]',
        '[class*="-ad-result"]',
        '.card-ad',
        '.card-ad-mainline'
      ]
    }
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
  const HIDDEN_ATTR = 'data-unsponsored-hidden';
  const HIDE_CSS = '[' + HIDDEN_ATTR + '] { display: none !important; }';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = HIDE_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeStyle() {
    const style = document.getElementById(STYLE_ID);
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }

  function markHidden(el) {
    if (el && el.nodeType === 1 && !el.hasAttribute(HIDDEN_ATTR)) {
      el.setAttribute(HIDDEN_ATTR, '1');
    }
  }

  function unmarkAll() {
    const hidden = document.querySelectorAll('[' + HIDDEN_ATTR + ']');
    hidden.forEach(function (el) { el.removeAttribute(HIDDEN_ATTR); });
  }

  function scan(root, config) {
    if (!root || root.nodeType !== 1) return;

    if (config.hideSelectors && config.hideSelectors.length) {
      const sel = config.hideSelectors.join(',');
      if (root.matches && root.matches(sel)) markHidden(root);
      root.querySelectorAll(sel).forEach(markHidden);
    }

    if (!config.cardSelector) return;
    const cardSel = config.cardSelector;

    if (config.markerSelectors && config.markerSelectors.length) {
      const msel = config.markerSelectors.join(',');
      if (root.matches && root.matches(msel)) {
        markHidden(root.closest(cardSel) || root);
      }
      root.querySelectorAll(msel).forEach(function (m) {
        markHidden(m.closest(cardSel) || m);
      });
    }

    if (config.markerTextRegex) {
      const re = config.markerTextRegex;
      const candidates = root.querySelectorAll('span, b, em, small, i, strong, abbr, label');
      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (el.children.length !== 0) continue;
        const txt = el.textContent;
        if (!txt || txt.length > 64) continue;
        if (re.test(txt)) {
          markHidden(el.closest(cardSel) || el);
        }
      }
    }
  }

  let observer = null;
  function observe(config) {
    if (observer) return;
    observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const added = mutations[i].addedNodes;
        for (let j = 0; j < added.length; j++) {
          const node = added[j];
          if (node.nodeType === 1) scan(node, config);
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function unobserve() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  const siteKey = getSiteKey();
  if (!siteKey) return;
  const config = SITE_CONFIG[siteKey];

  let enabled = true;
  function start() {
    ensureStyle();
    scan(document.documentElement, config);
    observe(config);
  }
  function stop() {
    unobserve();
    removeStyle();
    unmarkAll();
  }

  api.storage.sync.get('enabled', function (data) {
    enabled = data.enabled === undefined ? true : data.enabled;
    if (enabled) start();
  });

  api.runtime.onMessage.addListener(function (request) {
    if (!request || typeof request.enabled !== 'boolean') return;
    if (request.enabled && !enabled) {
      enabled = true;
      start();
    } else if (!request.enabled && enabled) {
      enabled = false;
      stop();
    }
  });
})();
