import type { ReadPageMessage, ReadPageResponse } from "@/background/main";

export function readPage(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const onReadPage = (response: ReadPageResponse) => {
      if (response.type === "READ_PAGE_RESPONSE") {
        chrome.runtime.onMessage.removeListener(onReadPage);
        resolve(response.page);
      } else {
        reject(new Error("Invalid response"));
      }
    };
    chrome.runtime.onMessage.addListener(onReadPage);
    chrome.runtime.sendMessage<ReadPageMessage>({
      type: "READ_PAGE",
    });
  });
}
