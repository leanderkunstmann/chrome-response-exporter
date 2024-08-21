// listen for request

let targetUrl = "https://test.test";

let listenerEnabled = false;

function requestListener(details) {
  if (details.url === targetUrl) {
    try {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: captureResponse,
        args: [details.url],
      });
    } catch (error) {
      console.log(error);
    } finally {
      chrome.webRequest.onCompleted.removeListener(requestListener);
      chrome.storage.local.set({ listenerEnabled: false });
    }
  }
}

function captureResponse(url) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      try {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "export.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.log(error);
      } finally {
        // Stop listening for web requests after the download is initiated
        chrome.webRequest.onCompleted.removeListener(requestListener);
        chrome.storage.local.set({ listenerEnabled: false });
      }
    });
}

// Enable or disable the listener based on messages from the popup
chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
  if (message.action === "enableListener" && !listenerEnabled) {
    chrome.webRequest.onCompleted.addListener(requestListener, {
      urls: [targetUrl],
    });
    listenerEnabled = true;
    chrome.storage.local.set({ listenerEnabled: true });
  } else if (message.action === "disableListener" && listenerEnabled) {
    chrome.webRequest.onCompleted.removeListener(requestListener);
    listenerEnabled = false;
    chrome.storage.local.set({ listenerEnabled: false });
  }
});

//TODO: 
// - replace checkbox with download button that is only clickable when data is available
// - make UI (popup.html) a little bit cleaner and allow inputting urls (also sync with storage)
// - add selection for different data formats and allow exporting in those (csv, yaml, json)
// - specific use case -> credit card data exporting
