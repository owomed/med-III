const { Events } = require('discord.js');

let lastNumber = 0;
let lastValidMessageId = null; // En son doğru sayıyı içeren mesajın ID'si
let userTimes = {}; // Kullanıcı bazında zaman damgaları
const countingChannelId = '1277619029804060692'; // Sayı sayma kanalının ID'sini buraya ekle

module.exports = {
    // Sayı sayma kanalı ID'si
    countingChannelId: countingChannelId,

    // Bot açıldığında son doğru sayıyı bulma
    async initializeLastNumber(client) {
        const channel = client.channels.cache.get(countingChannelId);
        if (!channel) {
            console.error('Sayı sayma kanalı bulunamadı.');
            return;
        }

        try {
            // Kanaldaki son mesajı getir
            const lastMessage = await channel.messages.fetch({ limit: 1 });
            if (lastMessage.size > 0) {
                const message = lastMessage.first();
                const content = message.content.trim();
                const number = parseInt(content.replace(/owo\s*/i, ''), 10);

                if (!isNaN(number)) {
                    lastNumber = number;
                    lastValidMessageId = message.id;
                    console.log(`Bot yeniden başlatıldı. Son doğru sayı: ${lastNumber}`);
                }
            }
        } catch (error) {
            console.error('Son mesajı bulurken hata oluştu:', error);
        }
    },

    // Yeni mesaj geldiğinde sayma işlemini yönetme
    async handleCounting(message) {
        if (message.channel.id !== countingChannelId || message.author.bot) return;

        const currentTime = Date.now();
        const messageContent = message.content.trim();
        const number = parseInt(messageContent.replace(/owo\s*/i, ''), 10);

        // Sayı değilse veya "owo" içermiyorsa işlem yapma
        if (isNaN(number) || !messageContent.toLowerCase().includes('owo')) return;

        // Kullanıcının son mesaj zamanını kontrol et
        const lastUserTime = userTimes[message.author.id] || 0;
        const timeSinceLastMessage = currentTime - lastUserTime;
        
        // 11 saniye bekleme süresi
        if (timeSinceLastMessage < 11000) {
            await message.react('1277604016313995305').catch(console.error); // Yanlış sayı veya zaman
            return;
        }

        // Eğer yazılan sayı beklenen sayıya eşitse
        if (number === lastNumber + 1) {
            await message.react('1277603930733412474').catch(console.error); // Doğru sayı
            try {
                await message.pin('Sayı sayma oyunu');
            } catch (pinError) {
                console.error('Mesajı sabitleme hatası:', pinError);
            }
            lastNumber = number;
            lastValidMessageId = message.id;
            userTimes[message.author.id] = currentTime; // Kullanıcının zaman damgasını güncelle
        } else {
            // Yanlış sayı girildiğinde
            await message.react('1277604016313995305').catch(console.error);
        }
    }
};
