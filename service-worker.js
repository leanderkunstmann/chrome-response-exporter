// service-worker.js

const targetUrl = "fixed url";

let authHeader = ""

function getTimestamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function isJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
}

function isCSV(text) {
  // Check if the content has at least one line and commas separating values
  const lines = text.trim().split("\n");
  if (lines.length === 0) return false;

  // Check if each line contains a consistent number of commas (columns)
  const columnCount = lines[0].split(",").length;
  return lines.every((line) => line.split(",").length === columnCount);
}

function exportButton(tabId, url) {
  try {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: captureResponse,
      args: [targetUrl], // change to targetURL for ignoring input
    });
  } catch (error) {
    console.log(error);
  } finally {
  }
}

function captureResponse(url) {
  fetch(url, {
    method: 'GET',  // Assuming a GET request
    headers: {
      'Authorization': authHeader,  // Add your token here
      'Content-Type': 'application/json'  // Optional, depending on the API
    }
  })
    .then((response) => response.blob())
    .then((blob) => {
      try {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `export-${getTimestamp()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.log(error);
      }
    });
}

function requestListener(details) {
  if (details.url === targetUrl) {
    try {
      let header = details.requestHeaders.find(header => header.name.toLowerCase() === 'authorization');
      authHeader = header.value
      if (authHeader) {
        console.log("Authorization Header:", authHeader);
      }
    } catch (error) {
      console.log(error);
    } finally {
      chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);
    }
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
  urls: [targetUrl],
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "executeServiceWorkerFunction") {
    exportButton(message.tabId, message.targetUrl);
  }
});
