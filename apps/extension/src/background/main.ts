chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener(async (message: Message) => {
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
        func: () => document.body.innerText,
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
  } else if (message.type === "CLICK_ELEMENT") {
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
    const success = (
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (selector) => {
          const element = document.querySelector(selector);
          console.log("element", element);
          if (element && element instanceof HTMLElement) {
            console.log("clicking element");
            element.click();
            return true;
          }
          console.log("no element found");
          return false;
        },
        args: [message.selector],
      })
    )[0]?.result;
    chrome.runtime.sendMessage<ClickElementResponse>({
      type: "CLICK_ELEMENT_RESPONSE",
      success: success ?? false,
    });
  } else if (message.type === "NAVIGATE_TO") {
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
    const tab = await chrome.tabs.update(tabId, { url: message.url });
    chrome.runtime.sendMessage<NavigateToResponse>({
      type: "NAVIGATE_TO_RESPONSE",
      success: !!tab,
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

export interface ClickElementMessage {
  type: "CLICK_ELEMENT";
  selector: string;
}

export interface ClickElementResponse {
  type: "CLICK_ELEMENT_RESPONSE";
  success: boolean;
}

export interface NavigateToMessage {
  type: "NAVIGATE_TO";
  url: string;
}

export interface NavigateToResponse {
  type: "NAVIGATE_TO_RESPONSE";
  success: boolean;
}

export type Message = ReadPageMessage | ClickElementMessage | NavigateToMessage;
export type MessageType = Message["type"];
export type Response =
  | ReadPageResponse
  | ClickElementResponse
  | NavigateToResponse;
export type ResponseType = Response["type"];
