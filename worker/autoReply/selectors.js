const SELECTORS = {
    inputs: {
      firstModalBtn: '[role="dialog"] button:first-child',
      dontSaveBrowserBtn: '.cmbtv [type="button"]',
      unsendBtn: "//button[contains(text(), 'Unsend')]",
      messageOptionsBtn: '[role="button"]',
      messageInput:
        'textarea[placeholder="Message..."]',
      sendBtn: "//button[contains(text(), 'Send')]",
      languageSelect: 'select[aria-label]',
      appNotNow: "//button[contains(text(), 'Not Now')]",
      backToDirects: 'a[tabindex="0"]',
      currentChatUserAvatar: '[style="width: 100%;"] > div > button',
      acceptCookies: "//button[contains(text(), 'Allow essential and optional cookies')]",
      getMobAppBtn: "//div[contains(text(), 'Get the Instagram app')]",
      goToLoginPage: "//div[contains(text(), 'Log In')]",
      firstChat: 'a[href^="/direct/t/"]:first-child',
      newMessageBtn: '[aria-label="New message"]'
    },
    blocks: {
      direct: '[style="height: 100%;"] a[href^="/direct/"]',
      chatsList: '[style="height: 100%; overflow: hidden auto;"]',
      messages: '[style="height: 100%; width: 100%;"] > div > div > div',
      modal: 'div[role="presentation"]',
      chatListVisibleArea: '[style="height: 100%;"] > [style="height: 100%;"]',
      firstMessage: '[style="height: 100%; width: 100%;"] > div > div > div:first-child',
      lastMessage:
        '[style="height: 100%; width: 100%;"] > div > div > div:last-child > [role="listbox"][tabindex="0"]',
      lastChat: '[style="height: 100%;"] [style="height: 100%; overflow: hidden auto;"] > div> div:last-child',
      userAvatar: '[style="width: 24px; height: 24px;"]',
      userProfilePicture: '[style="width: 24px; height: 24px;"] img',
      useMobApp: '[role="presentation"]',
      lastMessageFromReceiver: '[style="height: 100%; width: 100%;"] > div > div:last-child > div a[href^="/"]',
      messageWithAvatar: '[style="height: 100%; width: 100%;"] > div > div > div a[href^="/"]',
      unreadMessage: '[style="height: 8px; width: 8px;"][aria-label="Unread"]',
      invalidMessageType: '[style="height: 100%; width: 100%;"] > div > div > div:last-child > div:not([role="listbox"][tabindex="0"]) a[href]'
    },
    text: {
      username: 'div[aria-labelledby] div[id]:first-child',
      notAllowedToSendMessages: `//span[contains(text(), " can't receive your message. They don't allow new message requests from everyone.")]`,
      accountHasBeenBlocked: `//h2[contains(text(), "Your Account Has Been Temporarily Locked")]`,
    },
  };

  module.exports = SELECTORS;