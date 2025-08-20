// stayInVoice.js
const { joinVoiceChannel } = require('@discordjs/voice');
const { Client, GatewayIntentBits } = require('discord.js');

const channelId = '1235643294973956158'; // Ses kanalının ID'sini buraya ekleyin
const guildId = '788355812774903809'; // Botun bulunduğu sunucunun ID'sini buraya ekleyin

module.exports = (client) => {
    client.on('ready', () => {
        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.error('Sunucu bulunamadı.');
                return;
            }

            const voiceChannel = guild.channels.cache.get(channelId);
            if (!voiceChannel) {
                console.error('Ses kanalı bulunamadı.');
                return;
            }

            // Ses kanalına katıl
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false, // Botun sağır olmasını istemiyorsanız false yapın
                selfMute: false, // Botun sesinin kapalı olmasını istemiyorsanız false yapın
            });
            
            console.log(`Bot, '${voiceChannel.name}' adlı ses kanalına katıldı.`);

            // Bağlantı durumunu izle
            connection.on('stateChange', (oldState, newState) => {
                console.log(`Bağlantı durumu '${oldState.status}' -> '${newState.status}' olarak değişti.`);
            });
            
        } catch (error) {
            console.error('Ses kanalına katılma hatası:', error);
        }
    });
};
