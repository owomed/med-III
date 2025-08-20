const cron = require('node-cron');
const { Client, GatewayIntentBits } = require('discord.js');

// Emoji ikilileri
const emojiPairs = [
    ["<a:med_lblue_heart:1380155713120243942>", "<a:med_lblue_star:1380148386367406101>"],
    ["<a:med_pink_heart:1380155644061024317>", "<a:med_pink_star:1380150408122728588>"],
    ["<a:med_blue_heart:1380155966024056873>", "<a:med_blue_star:1380150502792101978>"],
    ["<a:bunun_redbulamadim:1380155397020717066>", "<a:med_red_star:1380150574451916850>"],
    ["<a:med_green_heart:1380155779386052699>", "<a:med_green_star:1380150712608227358>"],
    ["<a:med_purple_heart:1380155873242124408>", "<a:med_purple_star:1380150967252549862>"],
];

// Mesaj şablonu
const messageTemplate = `
Günaydınlar <@&1238180102454513845> (?)  **günlük checklist**'ini saat \`12.00\`'a kadar sunucumuzda tamamlayan **ilk 3 kişiye 100,000** <:med_cowoncy:1380158013754839132>  vereceğiz.

>     __**Güncel stok: 3**__ 

(!)   Oynarken **wb, wh ve owo** yazarak oynamanız gerekiyor.

(!) **OwO** yazmak zorunludur, yazmayan kişiler ödülden yararlanamayacaktır.

(!) Sunucu dışında **cl** tamamlayanların ödülleri verilmeyecektir.

(!) Bitiren kişiler <#1238413789540388917> kanalına **wcl ve !rr** yazıp göndersin.

Herkese kolay gelsin, iyi oyunlar   
(!)   Günlük statınız en az 75 olmalı! Mesaj atıldığında statınızı göremezsek veya 75'ten düşükse kazanmış sayılmazsınız
Etkinliğe burada başlanıp burada bitirilmesi gerekmekte.
`;

module.exports = (client) => {
    // Her gün Türkiye saatiyle saat 10:00'da çalışır
    cron.schedule('0 10 * * *', async () => {
        try {
            const now = new Date();
            // Haftanın gününe göre emoji seçimi
            const dayIndex = now.getDay() % emojiPairs.length;
            const [emoji1, emoji2] = emojiPairs[dayIndex];

            // Kanalı önbellekten bul
            const channel = client.channels.cache.get('1238045814388035651');
            if (!channel) {
                console.error("Kanal bulunamadı veya botun o kanala erişimi yok!");
                return;
            }

            const finalMessage = messageTemplate
                .replace(/\(\?\)/g, emoji1)
                .replace(/\(!\)/g, emoji2);

            // Mesajı gönder
            await channel.send(finalMessage);
            console.log(`[✓] Günlük mesaj başarıyla gönderildi (${now.toLocaleString()})`);
        } catch (err) {
            console.error("Günlük mesaj gönderilirken hata oluştu:", err);
        }
    }, {
        // Bu kısım zaman dilimini belirler
        timezone: "Europe/Istanbul"
    });
};
