const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { prefix } = require('./Settings/config.json');
const { readAFKData, writeAFKData } = require('./helper');
const afkCommand = require('./commands/afk');
const counting = require('./counting');
require('./stayInVoice.js');


const client = new Client({
  presence: {
    status: "idle",
    activity: { name: "MED Ⅲ", type: "LISTENING" }
  },
  intents: 3276799 // Gerekli tüm intentler (mesaj, emoji, guild vs.)
});

require('./dailyMessage')(client);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}


// Durum döngüsü
const statuses = [
  { name: 'MED Ⅲ', type: 'LISTENING' },
  { name: 'MED 💚 hicckimse', type: 'LISTENING' },
  { name: 'hicckimse 💛 MED', type: 'LISTENING' },
  { name: 'MED ❤️ hicckimse', type: 'LISTENING' },
  { name: 'hicckimse 🤍 MED', type: 'LISTENING' },
  { name: 'MED 🤎 hicckimse', type: 'LISTENING' },
  { name: 'hicckimse 💜 MED', type: 'LISTENING' },
  { name: 'MED 🩵 hicckimse', type: 'LISTENING' },
  { name: 'hicckimse 💙 MED', type: 'LISTENING' }
];
let statusIndex = 0;

client.on('ready', async () => {
  console.log(`Bot hazır: ${client.user.tag}`);

  const countingChannel = client.channels.cache.get(counting.countingChannelId);
  if (countingChannel) {
    await counting.initializeLastNumber(countingChannel);
  }

  setInterval(() => {
    statusIndex = (statusIndex + 1) % statuses.length;
    client.user.setPresence({
      activity: {
        name: statuses[statusIndex].name,
        type: statuses[statusIndex].type
      },
      status: 'idle'
    });
  }, 10000);
});

// OWO & Komut işlemleri burada birleşiyor
let activeEventChannels = {};
const settings = {};

client.on('message', async (message) => {
  if (message.author.bot || message.channel.type === 'dm') return;

  // AFK kontrolü
  afkCommand.handleMessages(message);
  afkCommand.checkMention(message);

  // Sayı sayma kanalı
  if (message.channel.id === counting.countingChannelId) {
    await counting.handleCounting(message);
    return;
  }

  // Şanslı sayı oyunu
  const channelId = message.channel.id;

  if (message.content === '.sayı') {
    const currentTime = Date.now();
    const eventEndTime = currentTime + 3600000;
    const randomNumbers = [Math.floor(Math.random() * 152), Math.floor(Math.random() * 152)];

    settings[channelId] = {
      luckyNumbers: randomNumbers,
      startTime: currentTime,
      eventEndTime: eventEndTime
    };

    activeEventChannels[channelId] = true;

    await message.channel.send(`
## Merhabalar, OwO MED ailesi <a:owo:1235316485942022185>

Saat <t:${Math.floor(eventEndTime / 1000)}:t> kadar <#1238045899360309289>, <#1277593114269454396>, <#1277593211363262546> ve <#1277593298047078460> kanallarında şanslı sayı oyunu oynuyoruz.

> OwO yazarak <@1236235490118860880>'ün vereceği sayılardan şanslı sayılara dikkat ediniz.
>  
> *Şanslı sayılar:* **${randomNumbers.join(', ')}**

**STOK:**
> *Stoklar sınırsızdır...*
> - Şanslı sayı çıkan kişiler; ödül alabilmeniz için sunucu içinde __**en az 100 OwO statınız olması gerekiyor.**__
`);
    setTimeout(() => {
      delete settings[channelId];
      delete activeEventChannels[channelId];
    }, 3600000);
  }

  const userCooldowns = {};

if (message.content.toLowerCase() === 'owo') {
  const channelSettings = settings[channelId];
  if (!channelSettings || !activeEventChannels[channelId]) return;

  const userId = message.author.id;
  const now = Date.now();

  // Kullanıcının önceki mesaj zamanı kontrol ediliyor
  if (userCooldowns[userId] && now - userCooldowns[userId] < 10000) return;

  userCooldowns[userId] = now; // Kullanıcının son yazdığı zamanı güncelle

  const randomResponse = Math.floor(Math.random() * 152);
  let replyMessage = '';

  if (channelSettings.luckyNumbers.includes(randomResponse)) {
    replyMessage += `<a:med_dogru:1278584943240544358> **${randomResponse}**`;
    await message.pin();
  } else {
    replyMessage += `<a:med_yanlis:1278584865796784170> **${randomResponse}**`;
  }

  await message.reply(replyMessage);
}


  // Prefix komutları
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName) || client.commands.find(x => x.aliases && x.aliases.includes(commandName));

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error('Komut çalıştırma hatası:', error);
    message.reply('Komut çalıştırılırken bir hata oluştu.');
  }
});

// BOTU BAŞLAT
client.login(process.env.TOKEN);

// Render için HTTP sunucusu (zorunlu değil ama Render'da şart gibi)
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot aktif ve çalışıyor.');
});

app.listen(port, () => {
  console.log(`Render HTTP sunucusu ${port} portunda dinleniyor.`);
});
