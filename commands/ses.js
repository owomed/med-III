const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    // Slash Komut verilerini tanımlama
    data: new SlashCommandBuilder()
        .setName('ses')
        .setDescription('Botun belirli bir ses kanalına katılmasını sağlar.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Botun katılacağı ses kanalı.')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildVoice)),
    
    // Prefix komutları için ad
    name: '3sesgir',
    
    async execute(interaction) {
        let voiceChannel;
        let responseMethod;

        // Komutun türünü belirleme
        if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            // Slash komutu ise
            responseMethod = (content) => interaction.reply({ content, ephemeral: true });
            voiceChannel = interaction.options.getChannel('kanal') || interaction.member.voice.channel;
        } else {
            // Prefix komutu ise
            responseMethod = (content) => interaction.reply({ content });
            const channelId = '1243483710670635079';
            voiceChannel = interaction.guild.channels.cache.get(channelId);
        }

        // Ses kanalının varlığını ve türünü kontrol etme
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
