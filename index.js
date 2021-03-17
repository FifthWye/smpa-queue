const dotenv = require('dotenv');
const { worker } = require('./worker/resender');
const { resenderQueue, addJob } = require('./queue');
const cron = require('node-cron');
const BotModel = require('./db/models/bot');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

process.setMaxListeners(0);

const producer = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  BotModel.find({}, (err, bots) => {
    bots.forEach(async ({ credentials, text }) => {
      await addJob(resenderQueue, { credentials, text });
    });
  });
};

const acc = {
  credentials: {
    username: 'newlove_agency',
    password: 'Polki123',
  },
  text: [
    '🥰Сотрудничество с NewLove. Привет, предлагаю доход от 700$-1200$. Регистрирую на 7-12 сайтах. Если твоя анкета есть на сайтах брачных агентств- мы предложим тебе другие варианты для увеличения пассивного дохода. С уважением, Кари, представитель агентства😊',
    '🥰😍ВНИМАНИЕ КАСТИНГ🤩 Доход от 2500$ ежемесячно Суть: спецы из США вкладывают деньги в раскрутку нового аккаунта с Вашими фото в инсте (от 2500$ доход) либо онлифанс (от 4000$). От Вас требуется оперативно предоставлять материалы для странички в течении 1-2 дней. Плюсы: -Вы сами контролируете контент, что приемлемо, что нет. - Самое важное, уровень зп. Откуда берутся деньги с инстаграмма (с онлифанс все и так ясно)? Американцы с нуля создают новую страницу в инсте с вашими материалами, вкладывают башенные деньги в анкету, в рекламу, и потом по подобию с брачными агентствами раскручиввют мужчин на деньги только в инсте.. РАСЧИТАНО на аудиторию США. Интересно? Тогда пришлю информацию для кастинга.',
  ],
};


addJob(resenderQueue, acc);

worker.on('completed', (job) => console.log(`Completed job ${job.id} successfully finished, all messages resent`));
worker.on('failed', (job, err) => console.log(`Failed job ${job.id} with ${err}`));

console.log('Queue started at ', new Date());
cron.schedule('05 11 * * *', async () => {
  producer();
});