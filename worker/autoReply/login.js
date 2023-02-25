const BotModel = require('../../db/models/bot');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

const login = async (page, { username, password }, { inputs, blocks }, jobId) => {
  const S = {
    inputs: {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
      login: "//div[contains(text(), 'Log In')]",
      submit: '[type="submit"]',
      ...inputs,
    },
    blocks,
  };

  await page.goto('https://www.instagram.com/accounts/login/', {
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

    const modalBtn = await page.$x(S.inputs.acceptCookies);

    if (modalBtn) await modalBtn[0].click();

    const loginBtn = await page.$x(S.inputs.login);

    if (loginBtn[0]) await loginBtn[0].click();

    await page.waitForXPath(S.inputs.acceptCookies, { hidden: true });

    await page.waitForSelector(S.inputs.username);
    await page.type(S.inputs.username, username);
    await page.type(S.inputs.password, password);
  } catch (error) {
    console.log(
      'Job id: ',
      jobId,
      ' | ',
      error,
      "\n Didn't find inputs to log in trying again with removeing modal if exists"
    );
    let $acceptBtn = await page.$(S.inputs.firstModalBtn);

    if ($acceptBtn) await $acceptBtn.click();

    await page.type(S.inputs.username, username);
    await page.type(S.inputs.password, password);
  }

  await page.click(S.inputs.submit);
  console.log('Job id: ', jobId, ' | ', 'Finaly logged in, getting rid of unneeded modal windows...');
  await page.waitForNavigation({
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  $acceptBtn = await page.$(S.inputs.dontSaveBrowserBtn);

  if ($acceptBtn) await $acceptBtn.click();

  const userAvatarEl = await page.$(S.blocks.userAvatar);
  const cookies = userAvatarEl ? await page.cookies() : null;
  const profilePicture = await page.$eval(S.blocks.userProfilePicture, (el) => el.src);

  const conn = await mongoose.connect(process.env.MONGO_URI);

  const botRecord = await BotModel.findOne({
    credentials: { username, password },
  });
  if (cookies !== null) {
    botRecord.profilePicture = profilePicture;
    botRecord.isValid = true;
    botRecord.sessionCookies = JSON.stringify(cookies);
    await botRecord.save();
  } else {
    botRecord.isValid = false;
    botRecord.isActive = false;
    await botRecord.save();
  }

  return cookies;
};

module.exports = login;
