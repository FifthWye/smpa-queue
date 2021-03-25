const { resenderQueue, addJob } = require('./queue');

const bots = [
  {
    credentials: {
      username: 'onemoredeepbreath',
      password: 'h3ySUPERhitHAJIKaA',
    },
    text: [
      "Нi 🌸 my name is Alexander. I'm from a dating agency. We work with sites such as; Prime Date, Anastasia, Dream Singles, Charmdate, jamp4love, Romance. You have a very beautiful appearance and must make money from your photographs. We want to offer you cooperation, namely to use your photos and pay a monthly fee for this in US dollars 💵. Your photos will be published solely for advertising purposes in order to improve the site's ranking. If you are interested in our offer, please indicate your age according to passport data and our agency will formulate for you the amount of the fee that we are ready to offer you in the process of cooperation. Sincerely, Alexander.❤️",
      'Здравствуйте, меня зовут Снежана👩🏼 Наше агентство одно из самых крупных агентств на площадке Dating сфер. Мы сотрудничаем и работаем на сайтах США - «PrimeDate» «Анастасия» «Дрим»«Чарминг» «Романс» «Джамп» Вы невероятно красивая и потрясающая😍! Ваши фотографии обязательно должны приносить Вам доход, поэтому я хочу предложить Вам следующее: С Вашего разрешения мы хотели бы разместить Ваши фотографии (БЕЗ ИНТИМНОГО ПОДТЕКСТА! Это не вебкам не эскорт) на вышеупомянутых сайтах. Ваши фотографии будут размещаться и публиковаться исключительно в рекламных целях, для ежемесячного повышения рейтинга сайта. В процессе сотрудничества мы готовы платить вам ежемесячную выплату/гонорар в долларах США. Если Вас заинтересовало наше предложение, укажите пожалуйста, сколько Вам полных лет🙈 (согласно паспортным данным)🌸',
    ],
  },
];

bots.forEach(async ({ credentials, config }) => {
  const { resenderText } = config;
  await addJob(resenderQueue, { credentials, text: resenderText });
});
