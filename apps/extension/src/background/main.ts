chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener(async (message: ReadPageMessage) => {
  if (message.type === "READ_PAGE") {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tabs[0].id) {
      console.error("No active tab found");
      throw new Error("No active tab found");
    }
    const page = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => document.body.innerHTML,
    });
    console.log("page", page[0].result);
    if (!page[0].result) {
      console.error("No page content found");
      throw new Error("No page content found");
    }
    chrome.runtime.sendMessage<ReadPageResponse>({
      type: "READ_PAGE_RESPONSE",
      page: page[0].result,
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
