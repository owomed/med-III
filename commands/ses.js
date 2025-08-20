const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    // 1. Slash Komut verilerini tanımlayın
    data: new SlashCommandBuilder()
        .setName('ses')
        .setDescription('Botun belirli bir ses kanalına katılmasını sağlar.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Botun katılacağı ses kanalı.')
                .setRequired(false) // Seçenek zorunlu değil
                .addChannelTypes(ChannelType.GuildVoice)), // Sadece ses kanallarını filtrele
    
    // Prefix komutları için ad
    name: '3sesgir',
    
    async execute(client, interactionOrMessage) {
        let voiceChannel;
        let responseMethod;

        // 2. Prefix veya Slash Komut olduğunu kontrol edin
        if (interactionOrMessage.isCommand?.()) {
            // Slash komutu ise
            responseMethod = (content) => interactionOrMessage.reply({ content, ephemeral: true });
            voiceChannel = interactionOrMessage.options.getChannel('kanal') || interactionOrMessage.member?.voice.channel;
        } else {
            // Prefix komutu ise
            responseMethod = (content) => interactionOrMessage.reply({ content });
            const channelId = '1243483710670635079'; // Sabit kanal ID'si
            voiceChannel = interactionOrMessage.guild.channels.cache.get(channelId);
        }

        // Ses kanalının varlığını ve türünü kontrol et
        if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
            return responseMethod('`Belirtilen ses kanalı bulunamadı veya geçerli bir ses kanalı değil.`');
        }

        try {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            return responseMethod(`\`${voiceChannel.name}\` ses kanalına katıldı.`);
        } catch (error) {
            console.error('Ses kanalına katılma hatası:', error);
            return responseMethod('`Ses kanalına katılırken bir hata oluştu.`');
        }
    },
};
