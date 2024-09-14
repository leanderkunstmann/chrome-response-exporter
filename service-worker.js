// service-worker.js

const targetUrl = "fixed url";


function exportButton(tabId, url) {
  try {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: captureResponse,
    args: [url], // change to targetURL for ignoring input
  });
  } catch (error) {
    console.log(error);
  } finally {
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
      }
    });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'executeServiceWorkerFunction') {
    exportButton(message.tabId, message.targetUrl);
  }
});
