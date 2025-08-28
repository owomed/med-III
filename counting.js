let lastNumber = 0;
let lastUserId = null; // En son doğru sayıyı yazan kullanıcının ID'si
const countingChannelId = '1410691761386426499'; // Sayı sayma kanalının ID'sini buraya ekle

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
            const messages = await channel.messages.fetch({ limit: 50 });
            for (const message of messages.values()) {
                const content = message.content.trim();
                const number = parseInt(content, 10);

                if (!isNaN(number)) {
                    lastNumber = number;
                    lastUserId = message.author.id;
                    console.log(`Bot yeniden başlatıldı. Son doğru sayı: ${lastNumber}`);
                    return; 
                }
            }
        } catch (error) {
            console.error('Son mesajları bulurken hata oluştu:', error);
        }
    },

    // Yeni mesaj geldiğinde sayma işlemini yönetme
    async handleCounting(message) {
        const messageContent = message.content.trim();
        const number = parseInt(messageContent, 10);

        if (isNaN(number)) {
            // Sayı değilse mesajı sil
            await message.delete().catch(console.error);
            return;
        }

        // Aynı kullanıcının ard arda sayı yazmasını engelle
        if (message.author.id === lastUserId) {
            await message.reply({
                content: `Hey, art arda sayı sayamazsın! Son sayı **${lastNumber}** olarak kalacak.`,
                allowedMentions: { repliedUser: true }
            });
            await message.delete().catch(console.error);
            return;
        }

        // Eğer yazılan sayı beklenen sayıya eşitse
        if (number === lastNumber + 1) {
            lastNumber = number;
            lastUserId = message.author.id;
            await message.react('1277603930733412474').catch(console.error); // Doğru sayı emojisi
        } else {
            // Yanlış sayı girildiğinde oyunu sıfırlama, sadece uyarı ver
            await message.reply({
                content: `Yanlış sayı! Doğru sayı **${lastNumber + 1}** idi.`,
                allowedMentions: { repliedUser: true }
            });
            await message.react('1277604016313995305').catch(console.error); // Yanlış sayı emojisi
        }
    }
};
