const { resenderQueue, addJob } = require('../queue');
const dotenv = require('dotenv');
const BotModel = require('../db/models/bot');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

// const bots = [
//   {
//     credentials: {
//       username: 'onemoredeepbreath',
//       password: 'h3ySUPERhitHAJIKaA',
//     },
//     text: [
//       "Нi 🌸 my name is Alexander. I'm from a dating agency. We work with sites such as; Prime Date, Anastasia, Dream Singles, Charmdate, jamp4love, Romance. You have a very beautiful appearance and must make money from your photographs. We want to offer you cooperation, namely to use your photos and pay a monthly fee for this in US dollars 💵. Your photos will be published solely for advertising purposes in order to improve the site's ranking. If you are interested in our offer, please indicate your age according to passport data and our agency will formulate for you the amount of the fee that we are ready to offer you in the process of cooperation. Sincerely, Alexander.❤️",
//       'Сотрудничество с Agency of Love. Здравствуйте, я представляю одно из самых крупных агентств в Dating сфере. Мы работаем на 9-ти американских сайтах. Ваши фото обязательно должны приносить Вам доход, поэтому я хочу предложить следующее: мы хотели бы разместить Ваши фото на вышеупомянутых веб-сайтах. Фото будут публиковаться в рекламных целях, для повышения рейтинга сайта. Ваш доход составит ~900-1350$ ежемесячно. Если Вы заинтересованы, укажите, пожалуйста, свой возраст. С наилучшими пожеланиями, Андрей🌹',
//     ],
//   },
// ];

// bots.forEach(async ({ credentials, text }) => {
//   await addJob(resenderQueue, { credentials, text });
// });

const producer = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  BotModel.find({ active: true }, (err, bots) => {
    bots.forEach(async ({ credentials, config }) => {
      const { resenderText } = config;
      await addJob(resenderQueue, { credentials, text: resenderText });
    });
  });
};

producer()