const puppeteer = require('puppeteer');
const stringSimilarity = require('string-similarity');
const dotenv = require('dotenv');
const { percentage, roundHundred } = require('../../utils/number');
const SELECTORS = require('./selectors');
const login = require('./login');
const iPhone = puppeteer.devices['iPhone 11'];

dotenv.config({ path: '../../config/config.env' });

const emojiRegEx = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

const formatText = (string) =>
  string
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s/g, '')
    .replace(emojiRegEx, '')
    .trim()
    .toLowerCase();

const scrollBottom = async (page, range, selector) =>
  await page.evaluate(
    (range, selector) => (selector ? document.querySelector(selector).scrollBy(0, range) : window.scrollBy(0, range)),
    range,
    selector
  );

const getReceivers = async (page, { text, blocks }, currentList) =>
  await page.evaluate(
    (selector, usernameSelector, blockerSelector, receivers) => {
      function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }

      const result = [];
      const els = document.querySelectorAll(selector);

      els.forEach((el) => {
        const username = el.querySelector(usernameSelector).textContent.trim();
        const url = el.href;
        const noBlockers = getElementByXpath(blockerSelector) === null;

        if (noBlockers && !receivers.some((obj) => obj.url === url))
          result.push({
            username,
            url,
          });
      });

      return result;
    },
    blocks.direct,
    text.username,
    text.notAllowedToSendMessages,
    currentList
  );

const getListOfReceivers = async (page, { blocks, inputs }, jobId) => {
  await page.goto('https://www.instagram.com/direct/inbox/', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  console.log('Job id: ', jobId, ' | ', 'Scrolling and getting chats list...');
  const appNotNowBtn = await page.$x(inputs.appNotNow);

  if (appNotNowBtn[0]) await appNotNowBtn[0].click();

  let receivers = [];
  const scrollRange = await page.$eval(blocks.chatListVisibleArea, (el) => el.scrollHeight);
  const distance = roundHundred(scrollRange);
  let totalScrollHeight = 0;
  let scrollHeight = await page.$eval(blocks.chatsList, (el) => el.scrollHeight);
  let noNewReceiversFoundCounter = 0;

  while (noNewReceiversFoundCounter <= 6) {
    scrollHeight = await page.$eval(blocks.chatsList, (el) => el.scrollHeight);
    await scrollBottom(page, distance * 2, blocks.chatsList);
    totalScrollHeight += distance;
    if (totalScrollHeight >= scrollHeight) {
      await page.waitForTimeout(4000);
    }

    const newReceivers = await getReceivers(page, SELECTORS, receivers);
    noNewReceiversFoundCounter = newReceivers.length === 0 ? noNewReceiversFoundCounter + 1 : 0;

    if (newReceivers.length) console.log('Job id: ', jobId, ' |', 'Found new chats:', newReceivers.length);

    receivers = [...receivers, ...newReceivers];
    await page.waitForTimeout(3000);

    noNewReceiversFoundCounter === 0
      ? console.log('Job id: ', jobId, ' |', 'Summary receivers', receivers.length)
      : console.log('Job id: ', jobId, ' | Retrying to get recivers');
    if (receivers.length >= 1500) break;
  }

  return receivers;
};

const sendMessage = async (page, { inputs }, text) => {
  await page.waitForSelector(inputs.messageInput);
  await page.$eval(inputs.messageInput, (el, text) => (el.value = text), text);
  await page.type(inputs.messageInput, ' ');
  await page.waitForXPath(inputs.sendBtn);
  const sendBtn = await page.$x(inputs.sendBtn);
  if (sendBtn[0]) await sendBtn[0].click();
};

const checkMessageTimeout = async (page, firstMessageSelector, timeout) => {
  const addHours = (date, h) => {
    return date.setTime(date.getTime() + h * 60 * 60 * 1000);
  };

  const getTimeFromString = (text) => {
    const [time, modifier] = text.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return {
      hours,
      minutes,
    };
  };

  const getSentTodayDate = (time) => {
    const { hours, minutes } = getTimeFromString(time);
    const today = new Date();
    today.setHours(hours, minutes, 0);

    return today;
  };

  const getSentYesterdayDate = (time) => {
    const { hours, minutes } = getTimeFromString(time);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(hours, minutes, 0);

    return yesterday;
  };

  const now = new Date();
  const aLotTimeAgo = new Date('December 17, 1995 03:24:00');
  const lastTimeSentText = (await page.$eval(firstMessageSelector, (el) => el.textContent))
    .replace('pm', ' PM ')
    .replace('am', ' AM ')
    .replace(/\s+/g, ' ')
    .trim();
  const splittedText = lastTimeSentText.split(' ');
  const lastWord = splittedText[splittedText.length - 1];
  const preLastWord = splittedText[splittedText.length - 2];
  const lastTwoWords = `${preLastWord} ${lastWord}`;

  const lastTimeSent =
    splittedText.length === 2
      ? getSentTodayDate(lastTimeSentText, now)
      : splittedText.length === 3
      ? getSentYesterdayDate(lastTwoWords, now)
      : aLotTimeAgo;

  return addHours(lastTimeSent, timeout) < now;
};

const unsendAndResendMessage = async (page, receiver, text, timeout, { blocks, inputs }, jobId) => {
  const hrefValue = receiver.url.replace('https://www.instagram.com', '');
  const chatSelector = `a[href="${hrefValue}"]`;
  let isChatFound = await page.evaluate((selector) => Boolean(document.querySelector(selector)), chatSelector);
  let searchForChatCounter = 0;

  while (!isChatFound && searchForChatCounter !== 4) {
    await scrollBottom(page, 100, blocks.chatsList);
    await page.waitForTimeout(1000);
    isChatFound = await page.evaluate((selector) => Boolean(document.querySelector(selector)), chatSelector);
    searchForChatCounter++;
  }

  try {
    const openChatArea = await page.$(chatSelector);
    if (openChatArea) {
      await openChatArea.click();
      await page.waitForTimeout(3000);
      console.log('Job id: ', jobId, ' | ', `\nLooking at chat with ${receiver.username}`);
      await page.waitForSelector(blocks.lastMessage);
      const isTheOnlyMessage = (await page.$$(blocks.messages)).length === 1;
      const lastMessageText = (await page.$eval(blocks.lastMessage, (el) => el.textContent)).trim();
      const lastMessageTextFound = text.find((messageText) => {
        const similarity = stringSimilarity.compareTwoStrings(formatText(messageText), formatText(lastMessageText));
        const isHigherThanNinety = Math.round(similarity.toFixed(2) * 100) >= 90;
        console.log('Job id: ', jobId, ' | ', 'Message similarity in percents ', similarity.toFixed(2) * 100);

        return isHigherThanNinety;
      });
      const isLastMessageValid = lastMessageTextFound !== undefined;
      const isTimeoutPassed = await checkMessageTimeout(page, blocks.firstMessage, timeout);
      console.log('Job id: ', jobId, ' | ', ' Is message first to this contact:', isTheOnlyMessage);
      console.log('Job id: ', jobId, ' | ', ' Is needed text found:', isLastMessageValid);
      console.log('Job id: ', jobId, ' | ', ' Has enough time passed:', isTimeoutPassed);

      if (isTheOnlyMessage && isLastMessageValid && isTimeoutPassed) {
        console.log('Job id: ', jobId, ' | ', `${receiver.username} didn't get message for ${timeout}h:`);
        console.log('Job id: ', jobId, ' | ', 'Found message, removing...');
        let unsendAttempts = 0;
        while ((await page.$(blocks.messages)) && unsendAttempts <= 6) {
          try {
            const messageBtnSelector = `${blocks.lastMessage} ${inputs.messageOptionsBtn}`;
            await page.waitForSelector(messageBtnSelector, {
              visible: true,
              timeout: 4000,
            });
            await page.click(messageBtnSelector);
            await page.keyboard.press('Enter', { delay: 1500 });
            await page.waitForXPath(inputs.unsendBtn, {
              visible: true,
              timeout: 4000,
            });
            const unsendBtn = await page.$x(inputs.unsendBtn);
            await unsendBtn[0].click();
            await page.waitForTimeout(1000);
          } catch (error) {
            console.log(
              'Job id: ',
              jobId,
              ' | ',
              `Got some problems while removing message : ${error}`,
              'Trying again'
            );
            unsendAttempts = unsendAttempts + 1;
          }
        }
        console.log('Job id: ', jobId, ' | ', 'Message removed');
        console.log('Job id: ', jobId, ' | ', 'Sending message...');
        if (unsendAttempts !== 6) {
          while ((await page.$(blocks.messages)) === null) {
            await sendMessage(page, SELECTORS, lastMessageText);
            await page.waitForTimeout(2000);
          }
          console.log('Job id: ', jobId, ' | ', `New message sent to ${receiver.username}`);
          await page.click(inputs.backToDirects);
          await page.waitForTimeout(1500);

          return true;
        }
      }
      await page.click(inputs.backToDirects);
      await page.waitForTimeout(1500);
    }
  } catch (error) {
    console.log('Job id: ', jobId, ' | ', 'Something went wrong while opening chat: ', error);
  } finally {
    return false;
  }
};

const resendMessages = async (page, receivers, text, { blocks }, job) => {
  const jobId = job.id;
  console.log('Job id: ', jobId, ' | ', `Got ${receivers.length} chats`);
  await page.evaluate((selector) => (document.querySelector(selector).scrollTop = 0), blocks.chatsList);

  console.log('Job id: ', jobId, ' | ', 'Just scrolled to the top of all chats, trying to resend all messages...');

  let messagesResent = 0,
    receiverIndex = 0;
  const failedDialogs = [];

  console.log(receivers);

  for await (const receiver of receivers) {
    const isMessageResent = await unsendAndResendMessage(page, receiver, text, 3, SELECTORS, jobId);

    if (isMessageResent) {
      messagesResent++;
    } else{
      failedDialogs.push(receiver.username)
    }

    job.updateProgress(percentage(receiverIndex + 1, receivers.length, 0));
    receiverIndex++;
  }

  await page.waitForTimeout(1000);
  console.log('Job id: ', jobId, ' | ', 'All messages were resent!');

  return { messagesResent, invalidDialoguesAmount: failedDialogs.length, failedDialogs };
};

const run = async (job) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      '--proxy-server=zproxy.lum-superproxy.io:22225',
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
    const receivers = await getListOfReceivers(page, SELECTORS, job.id);
    await job.update({ ...job.data, receiversAmount: receivers.length });

    if (receivers.length === 10) throw new Error("Dialogs load limit, couldn't get more than 10 receivers");

    const { text } = job.data;

    const stats = await resendMessages(page, receivers, text, SELECTORS, job);
    await job.update({ ...job.data, ...stats });
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
};

module.exports = run;
