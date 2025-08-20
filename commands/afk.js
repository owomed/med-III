const { SlashCommandBuilder } = require('discord.js');
const { readAFKData, writeAFKData } = require('../helper');

module.exports = {
    // Prefix komutları için gerekli bilgiler
    name: 'afk',
    aliases: ['away'],

    // Slash komutları için gerekli builder yapısı
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('AFK moduna geçmenizi sağlar.')
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('AFK olma sebebiniz.')
                .setRequired(false)),

    /**
     * Hem slash hem de prefix komutlarını çalıştıran ana fonksiyon
     * @param {object} interaction Mesaj veya etkileşim nesnesi
     * @param {string[]} args Prefix komutu için argümanlar
     */
    async execute(interaction, args) {
        let reason;
        let member;
        let isSlashCommand = false;

        // Komutun türünü belirle (slash veya prefix)
        if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            isSlashCommand = true;
            reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
            member = interaction.member;
        } else {
            // Geleneksel prefix komutu
            reason = args.join(' ') || 'Sebep belirtilmedi';
            member = interaction.member;
        }

        const nickname = member.nickname || interaction.user.username;

        try {
            // AFK verilerini asenkron olarak oku ve güncelle
            const afkData = await readAFKData();
            afkData[interaction.user.id] = { reason: reason, nickname: nickname };
            await writeAFKData(afkData);

            // Kullanıcı takma adını değiştirme
            await member.setNickname(`[AFK] ${nickname}`).catch(console.error);

            const replyContent = `\`\`\`diff\n- ${reason ? `Şu anda "${reason}" sebebiyle AFK modundasınız.` : 'Şu anda AFK modundasınız, sebep belirtilmedi.'}\n\`\`\``;

            // Yanıtı komut türüne göre gönder
            if (isSlashCommand) {
                await interaction.reply({ content: replyContent, ephemeral: true });
            } else {
                await interaction.reply({ content: replyContent, allowedMentions: { repliedUser: false } });
            }

        } catch (error) {
            console.error('AFK komutu çalıştırılırken bir hata oluştu:', error);
            const errorContent = 'AFK moduna geçerken bir hata oluştu.';

            if (isSlashCommand) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorContent, ephemeral: true });
                } else {
                    await interaction.reply({ content: errorContent, ephemeral: true });
                }
            } else {
                await interaction.reply(errorContent);
            }
        }
    },
};
