chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener(async (message: ReadPageMessage) => {
  if (message.type === "READ_PAGE") {
    const tabId = (
      await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0]?.id;
    if (!tabId) {
      console.error("No active tab found");
      throw new Error("No active tab found");
    }
    const page = (
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.documentElement.outerHTML,
      })
    )[0]?.result;
    if (!page) {
      console.error("No page content found");
      throw new Error("No page content found");
    }
    chrome.runtime.sendMessage<ReadPageResponse>({
      type: "READ_PAGE_RESPONSE",
      page,
    });
  }
});

export interface ReadPageMessage {
  type: "READ_PAGE";
}

export interface ReadPageResponse {
  type: "READ_PAGE_RESPONSE";
  page: string;
}
