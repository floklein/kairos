import type { Message, Response } from "@/background/main";

export function sendMessageAsync<M extends Message, R extends Response>(
  message: M,
): Promise<R> {
  return new Promise((resolve, reject) => {
    const onMessage = (response: R) => {
      if (response.type === `${message.type}_RESPONSE`) {
        chrome.runtime.onMessage.removeListener(onMessage);
        resolve(response);
      } else {
        reject(new Error("Invalid response"));
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    chrome.runtime.sendMessage(message);
  });
}
