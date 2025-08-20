const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Prefix Komut Adı
    name: '3ping',
    // Prefix Komut Takma Adları (İsteğe bağlı)
    aliases: ['ping', 'gecikme'],

    // Slash komutu için gerekli builder yapısı
    data: new SlashCommandBuilder()
        .setName('3ping')
        .setDescription('Botun gecikmesini hesaplar.'),

    // Prefix ve Slash komutları için ortak işlev gören ana fonksiyon
    async execute(interaction) {
        let sentMessage;

        // Komutun prefix mi yoksa slash mı olduğunu kontrol et
        if (interaction.isChatInputCommand) {
            // Slash komutu için geçici bir cevap gönder
            await interaction.reply({ content: '`Ping hesaplanıyor...`', fetchReply: true })
            .then(message => sentMessage = message);
        } else {
            // Prefix komutu için normal bir cevap gönder
            sentMessage = await interaction.reply('`Ping hesaplanıyor...`');
        }

        const ping = sentMessage.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setTitle('Pong!🏓')
            .setDescription(`Botun gecikmesi: **${ping}ms**\nAPI gecikmesi: **${apiPing}ms**`)
            .setColor('#00ff00')
            .setTimestamp();

        if (interaction.isChatInputCommand) {
            // Slash komutu için cevabı düzenle
            await interaction.editReply({ content: null, embeds: [embed] });
        } else {
            // Prefix komutu için cevabı düzenle
            await sentMessage.edit({ content: null, embeds: [embed] });
        }
    },
};
