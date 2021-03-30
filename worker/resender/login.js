const BotModel = require('../../db/models/bot');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

const login = async (page, { username, password }, { inputs, blocks }, jobId) => {
  const S = {
    inputs: {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
      login: "//button[contains(text(), 'Log In')]",
      submit: '[type="submit"]',
      ...inputs,
    },
    blocks,
  };

  await page.goto('https://www.instagram.com', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  console.log('Job id: ', jobId, ' | ', 'Try to log in...');

  try {
    let isEnglishModeOn =
      (await page.$eval(S.inputs.languageSelect, (el) => el.getAttribute('aria-label'))) !== 'Switch Display Language';

    while (isEnglishModeOn) {
      await page.select(S.inputs.languageSelect, 'en');
      await page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      isEnglishModeOn =
        (await page.$eval(inputs.languageSelect, (el) => el.getAttribute('aria-label'))) !== 'Switch Display Language';
    }

    const loginBtn = await page.$x(S.inputs.login);

    if (loginBtn[0]) await loginBtn[0].click();

    await page.waitForSelector(S.inputs.username);
    await page.type(S.inputs.username, username);
    await page.type(S.inputs.password, password);
  } catch (error) {
    console.log(
      'Job id: ',
      jobId,
      ' | ',
      error,
      "Didn't find inputs to log in trying again with removeing modal if exists"
    );
    let $acceptBtn = await page.$(S.inputs.firstModalBtn);

    if ($acceptBtn) await $acceptBtn.click();

    await page.type(S.inputs.username, username);
    await page.type(S.inputs.password, password);
  }

  await page.click(S.inputs.submit);
  console.log('Job id: ', jobId, ' | ', 'Finaly logged in, getting rid of unneeded modal windows...');
  await page.waitForNavigation({
    waitUntil: 'networkidle0',
    timeout: 60000,
  });
  $acceptBtn = await page.$(S.inputs.dontSaveBrowserBtn);

  if ($acceptBtn) await $acceptBtn.click();

  await page.waitForNavigation({
    waitUntil: 'networkidle0',
    timeout: 60000,
  });
  const userAvatarEl = await page.$(S.blocks.userAvatar);
  const cookies = userAvatarEl ? await page.cookies() : null;

  if (cookies !== null) {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    const userRecord = await BotModel.findOne({
      credentials: { username, password },
    });
    userRecord.sessionCookies = JSON.stringify(cookies);
    await userRecord.save();
  }

  return cookies;
};

module.exports = login;
