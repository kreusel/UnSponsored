(function () {
  'use strict';

  const api = typeof browser !== 'undefined' ? browser : chrome;

  document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggleSwitch');

    api.storage.sync.get('enabled', function (data) {
      const isEnabled = data.enabled === undefined ? true : data.enabled;
      toggleSwitch.checked = isEnabled;
    });

    toggleSwitch.addEventListener('change', function () {
      const isEnabled = toggleSwitch.checked;
      api.storage.sync.set({ enabled: isEnabled });

      api.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs || !tabs[0]) {
          return;
        }
        try {
          const sending = api.tabs.sendMessage(tabs[0].id, { enabled: isEnabled });
          if (sending && typeof sending.catch === 'function') {
            sending.catch(function () {});
          }
        } catch (_) {
          // Tab may not have a content script (e.g. unsupported site); ignore.
        }
      });
    });
  });
})();
