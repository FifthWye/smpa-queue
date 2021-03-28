const SELECTORS = {
    inputs: {
      firstModalBtn: '[role="dialog"] button:first-child',
      dontSaveBrowserBtn: '[role="main"] .cmbtv [type="button"]',
      unsendBtn: '[aria-hidden="false"] > div:last-child > div:last-child > [type="button"]',
      messageOptionsBtn: '[role="listbox"][tabindex="0"] > [type="button"]',
      messageInput:
        '[style="height: 100%; width: 100%; max-width: 935px;"] [style="height: 100%;"] > div:last-child > div:last-child> div:last-child textarea',
      sendBtn: "//button[contains(text(), 'Send')]",
      languageSelect: 'select[aria-label]',
    },
    blocks: {
      direct: '[style="height: 100%;"] a[href^="/direct/"]',
      chatsList: '[style="height: 100%; overflow: hidden auto;"]',
      messages: '[style="height: 100%;"] [style="height: 100%; width: 100%;"] div [role="listbox"]',
      modal: 'div[role="presentation"]',
      chatListVisibleArea: '[style="height: 100%;"] > [style="height: 100%;"] > div',
      firstMessage: '[style="height: 100%;"] [style="height: 100%; width: 100%;"] > div > div > div:first-child',
      lastMessage:
        '[style="height: 100%;"] [style="height: 100%; width: 100%;"] > div > div > div:last-child > [role="listbox"][tabindex="0"]',
      lastChat: '[style="height: 100%;"] [style="height: 100%; overflow: hidden auto;"] > div> div:last-child',
      userAvatar: '[style="width: 22px; height: 22px;"]',
    },
    text: {
      username: 'div[aria-labelledby] div[id]:first-child',
      notAllowedToSendMessages: `//span[contains(text(), " can't receive your message. They don't allow new message requests from everyone.")]`,
    },
  };

  module.exports = SELECTORS;