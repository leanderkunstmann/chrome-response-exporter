document.addEventListener('DOMContentLoaded', () => {
    const toggleListener = document.getElementById('toggleListener');

    // Get the current state of the listener from the background script
    chrome.storage.local.get('listenerEnabled', (data) => {
        toggleListener.checked = data.listenerEnabled || false;
    });

    // Listen for checkbox changes
    toggleListener.addEventListener('change', (event) => {
        if (event.target.checked) {
            // Enable the listener
            chrome.runtime.sendMessage({ action: 'enableListener' });
        } else {
            // Disable the listener
            chrome.runtime.sendMessage({ action: 'disableListener' });
        }
    });
});
