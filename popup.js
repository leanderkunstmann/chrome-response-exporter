// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const button = document.getElementById('exportButton');

  button.addEventListener('click', async function () {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send a message to the service worker with the current tab ID
    chrome.runtime.sendMessage({ action: 'executeServiceWorkerFunction', tabId: tab.id, targetUrl: document.getElementById('targetUrl').value });
  });
});
