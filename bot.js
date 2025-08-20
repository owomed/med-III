const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./Settings/config.json');
const { readAFKData, writeAFKData } = require('./helper');
const counting = require('./counting'); 
const dailyMessage = require('./dailyMessage');
const stayInVoice = require('./stayInVoice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
    
});

client.commands = new Collection();
client.aliases = new Collection();

// Komutları yükleme
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
    
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
                client.aliases.set(alias, command);
            });
        }
    } else {
        console.log(`[UYARI] ${filePath} dosyasında eksik "name" veya "execute" özelliği var.`);
    }
}

// Olayları yükleme
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, config));
    } else {
        client.on(event.name, (...args) => event.execute(...args, config));
    }
}

// Komut ve Olay İşleme
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Slash komutu çalıştırma hatası:', error);
        const replyContent = 'Bu komutu çalıştırırken bir hata oluştu!';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: replyContent, ephemeral: true });
        } else {
            await interaction.reply({ content: replyContent, ephemeral: true });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || message.channel.type === 'dm') return;

    const { prefix } = config;
    const afkData = await readAFKData();

    // AFK kontrolü
    const afkCommand = client.commands.get('afk');
    if (afkCommand) {
        if (afkData[message.author.id]) {
            const userData = afkData[message.author.id];
            delete afkData[message.author.id];
            await writeAFKData(afkData);
            await message.member.setNickname(userData.nickname).catch(console.error);
            await message.reply({ content: '`AFK modundan çıktınız. Hoş geldiniz!`', allowedMentions: { repliedUser: false } });
        }

        message.mentions.users.forEach(async user => {
            if (afkData[user.id]) {
                const userData = afkData[user.id];
                await message.reply({ content: `\`${user.username} şu an "${userData.reason}" sebebiyle AFK.\``, allowedMentions: { repliedUser: false } });
            }
        });
    }

    // Sayı sayma oyunu
    if (message.channel.id === counting.countingChannelId) {
        await counting.handleCounting(message);
    }

    // Prefix komutları
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName) || client.aliases.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error('Prefix komutu çalıştırma hatası:', error);
        message.reply('Komut çalıştırılırken bir hata oluştu.');
    }
});

client.on('ready', async () => {
    console.log(`Bot hazır: ${client.user.tag}`);

    // İstenilen tekli özel durumu ayarla
    client.user.setPresence({
        status: 'idle',
        activities: [{
            name: 'customname',
            type: ActivityType.Custom,
            state: 'OwO 💙 MED ile ilgileniyor'
        }],
    });
    
    // Diğer modülleri başlatma
    await counting.initializeLastNumber(client);
    dailyMessage(client);
    stayInVoice(client);
});

// BOTU BAŞLAT
client.login(process.env.TOKEN);
