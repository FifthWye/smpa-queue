const puppeteer = require('puppeteer');
const stringSimilarity = require('string-similarity');
const dotenv = require('dotenv');
const SELECTORS = require('./selectors');
const login = require('./login');
const iPhone = puppeteer.devices['iPhone 11'];

dotenv.config({ path: '../../config/config.env' });

const emojiRegEx =
  /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

const scrollBottom = async (page, range, selector) =>
  await page.evaluate(
    (range, selector) => (selector ? document.querySelector(selector).scrollBy(0, range) : window.scrollBy(0, range)),
    range,
    selector
  );

const formatText = (string) =>
  string
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s\s+/g, '')
    .replace(emojiRegEx, '')
    .trim()
    .toLowerCase();

const isNewMessageReceived = async (page, { blocks }, jobId) => (await page.$(blocks.unreadMessage)) || false;

const sendMessage = async (page, { inputs }, text) => {
  await page.waitForSelector(inputs.messageInput);
  await page.$eval(inputs.messageInput, (el, text) => (el.value = text), text);
  await page.type(inputs.messageInput, ' ');
  await page.waitForXPath(inputs.sendBtn);
  const sendBtn = await page.$x(inputs.sendBtn);
  if (sendBtn[0]) await sendBtn[0].click();
};

const getUnreadMessages = async (page, { blocks }) => {
  const lastMessages = await page.evaluate((selector) => {
    const elements = document.querySelectorAll(selector);
    const messagesContent = Array.from(elements).map((el) => {
      if (!el.querySelector('[role="listbox"]')) return null;
      if (el.querySelector('.VdURK')) return null; //message sent by bot shouldn't be counted
      return el.textContent.trim();
    });

    const lastNullIndex = messagesContent.lastIndexOf(null);

    return messagesContent.slice(lastNullIndex + 1);
  }, blocks.messages);

  return lastMessages;
};

const findMatchAndSendReply = async (page, { blocks, inputs }, job) => {
  const { replies } = job.data;
  if (replies.length !== 0) {
    const unreadMessages = await getUnreadMessages(page, { blocks });
    const answers = [];
    for (const messageText of unreadMessages) {
      for (let { keywords, answer } of replies) {
        const IsKeywordMatch = keywords.find((text) => {
          const similarity = stringSimilarity.compareTwoStrings(formatText(text), formatText(messageText));
          const isHigherThanSeventy = Math.round(similarity.toFixed(2) * 100) >= 70;

          return isHigherThanSeventy;
        });

        if (IsKeywordMatch) answers.push(answer);
      }
    }

    const uniqueAnswers = answers.filter((item, i, ar) => ar.indexOf(item) === i);

    const { defaultReply } = job.data;

    const undefinedMessageText =
      defaultReply !== ''
        ? defaultReply
        : "Sorry, I didn't understand your message. Please wait until account moderator will log in to account.";

    if (unreadMessages.length !== 0 && answers.length === 0) await sendMessage(page, SELECTORS, undefinedMessageText);
    for (const reply of uniqueAnswers) {
      await sendMessage(page, SELECTORS, reply);
    }

    while (!(await page.$(blocks.chatsList))) {
      await page.click(inputs.backToDirects);
      await page.waitForTimeout(1500);
    }
  }
};

const replyToMessage = async (page, { inputs, blocks }, job) => {
  console.log('Job id: ', job.id, ' | ', 'New message received');
  while (await page.$(blocks.unreadMessage)) {
    await page.click(blocks.unreadMessage);
    await page.waitForTimeout(5000);

    let isLastMessageElFound;
    try {
      await Promise.race([page.waitForSelector(blocks.lastMessage), page.waitForSelector(blocks.invalidMessageType)]);
      isLastMessageElFound = Boolean(await page.$(blocks.lastMessage));
    } catch (error) {
      isLastMessageElFound = false;
    }

    if (isLastMessageElFound) {
      await findMatchAndSendReply(page, SELECTORS, job);
    }
  }
};

const run = async (job) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      //'--proxy-server=zproxy.lum-superproxy.io:22225',
      '--disable-notifications',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
  });
  try {
    const page = await browser.newPage();
    await page.emulate(iPhone);
    await page.authenticate({
      username: process.env.LUM_ZONE,
      password: process.env.LUM_PASSWORD,
    });
    const { sessionCookies, credentials } = job.data;
    const cookies = sessionCookies ? JSON.parse(sessionCookies) : await login(page, credentials, SELECTORS, job.id);

    if (cookies === null) throw new Error("Couldn't get session cookies");

    await page.setCookie(...cookies);
    await job.update({ ...job.data, loggedIn: true });
    const accountHasBeenBlocked = await page.$x(SELECTORS.text.accountHasBeenBlocked);
    await page.goto('https://www.instagram.com/direct/inbox/', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    const loginButton = await page.$x(SELECTORS.inputs.goToLoginPage);

    if (loginButton[0]) await login(page, credentials, SELECTORS, job.id);

    if (accountHasBeenBlocked[0]) await job.update({ ...job.data, accountHasBeenBlocked: true });

    const appNotNowBtn = await page.$x(SELECTORS.inputs.appNotNow);

    if (appNotNowBtn[0]) await appNotNowBtn[0].click();

    if (!(await isNewMessageReceived(page, SELECTORS))) {
      await scrollBottom(page, 622, SELECTORS.blocks.chatsList);
    }
    while (await isNewMessageReceived(page, SELECTORS)) {
      await replyToMessage(page, SELECTORS, job);
      if (!(await isNewMessageReceived(page, SELECTORS))) {
        await page.waitForTimeout(1000);
        await scrollBottom(page, 622, SELECTORS.blocks.chatsList);
      }
    }
  } catch (error) {
    throw error;
  } finally {
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));
    await browser.close();
  }
};

module.exports = run;
