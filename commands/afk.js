const { SlashCommandBuilder } = require('discord.js');
// MongoDB modelini içe aktar
const AFKModel = require('../models/AFK'); // Yolu kendinize göre düzenleyin!

module.exports = {
    // Prefix komutları için gerekli bilgiler
    name: 'afk',
    aliases: ['away'],

    // Slash komutları için gerekli builder yapısı
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('AFK moduna geçmenizi sağlar veya AFK modundan çıkmanızı sağlar.')
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
            reason = interaction.options.getString('sebep'); // Sebep null olabilir
            member = interaction.member;
        } else {
            // Geleneksel prefix komutu
            reason = args.join(' '); // Sebep boş olabilir
            member = interaction.member;
        }

        const userId = member.id;
        const guildId = member.guild.id;
        const currentNickname = member.nickname || interaction.user.username;

        try {
            // Kullanıcının mevcut AFK kaydını kontrol et
            const existingAFK = await AFKModel.findOne({ userId, guildId });

            if (existingAFK) {
                // --- AFK'DAN ÇIKMA İŞLEMİ (Sadece Komutla) ---
                
                // Takma adı eski haline getir
                await member.setNickname(existingAFK.nickname || currentNickname)
                    .catch(e => console.error('AFK çıkışı takma ad sıfırlama hatası:', e));
                
                // Kaydı veritabanından sil
                await AFKModel.deleteOne({ userId, guildId });
                
                const replyContent = `\`\`\`diff\n+ Başarıyla AFK modundan çıktınız! Tekrar hoş geldiniz.\n\`\`\``;

                // Yanıtı komut türüne göre gönder
                if (isSlashCommand) {
                    await interaction.reply({ content: replyContent, ephemeral: true });
                } else {
                    await interaction.reply({ content: replyContent, allowedMentions: { repliedUser: false } });
                }

            } else {
                // --- AFK'YA GİRME İŞLEMİ ---
                
                const afkReason = reason || 'Sebep belirtilmedi';
                
                // Yeni AFK kaydını oluştur ve veritabanına kaydet
                const newAFK = new AFKModel({
                    userId: userId,
                    reason: afkReason,
                    guildId: guildId,
                    // Mevcut takma adı (AFK etiketi eklenmeden önceki) kaydet
                    nickname: currentNickname 
                });
                await newAFK.save();

                // Kullanıcı takma adını değiştirme
                await member.setNickname(`[AFK] ${currentNickname}`)
                    .catch(e => console.error('AFK takma ad değiştirme hatası:', e));

                const replyContent = `\`\`\`diff\n- ${afkReason ? `Şu anda "${afkReason}" sebebiyle AFK modundasınız.` : 'Şu anda AFK modundasınız, sebep belirtilmedi.'}\n\`\`\``;

                // Yanıtı komut türüne göre gönder
                if (isSlashCommand) {
                    await interaction.reply({ content: replyContent, ephemeral: true });
                } else {
                    await interaction.reply({ content: replyContent, allowedMentions: { repliedUser: false } });
                }
            }

        } catch (error) {
            console.error('AFK komutu çalıştırılırken bir hata oluştu:', error);
            const errorContent = 'AFK işlemi sırasında bir hata oluştu.';

            // Hata yanıtı gönderme
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
