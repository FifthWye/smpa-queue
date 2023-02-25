const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

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
};

const login = async (page, { username, password }, { inputs }) => {
  const S = {
    inputs: {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
      login: '[type="submit"]',
      ...inputs,
    },
  };

  await page.goto('https://www.instagram.com', {
    waitUntil: 'networkidle0',
  });

  let $acceptBtn = await page.$(S.inputs.firstModalBtn);

  if ($acceptBtn) await $acceptBtn.click();

  await page.waitForSelector(S.inputs.username, { timeout: 60000 });

  console.log('Try to log in...');

  await page.type(S.inputs.username, username);
  await page.type(S.inputs.password, password);
  await page.click(S.inputs.login);
};

const run = async (credentials) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--disable-notifications', ],
  });
  try {
    const page = await browser.newPage();
    // await page.authenticate({
    //   username: process.env.LUM_ZONE,
    //   password: process.env.LUM_PASSWORD,
    // });
    await login(page, credentials, SELECTORS);

    await page.waitForSelector('[role="link"][tabindex="0"]', { timeout: 60000 });

    console.log('Finaly logged in');
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
};

const credentials = {
  username: 'yarsheva',
  password: '62956438Nm',
};

run(credentials);
