let lastNumber = 0;
let lastUserId = null;
const countingChannelId = '1410691761386426499';

module.exports = {
    countingChannelId: countingChannelId,

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

    async handleCounting(message) {
        let messageContent = message.content.trim();

        // "OwO" veya "owo" gibi ifadeleri temizle ve sadece sayıyı ayıkla
        messageContent = messageContent.replace(/owo/gi, '').trim();

        const number = parseInt(messageContent, 10);

        if (isNaN(number)) {
            await message.reply({
                content: 'Lütfen sadece bir sayı veya "owo <sayı>" şeklinde bir mesaj girin.',
                allowedMentions: { repliedUser: true }
            });
            return;
        }

        if (message.author.id === lastUserId) {
            await message.reply({
                content: `Hey, art arda sayı sayamazsın! Son sayı **${lastNumber}** olarak kalacak.`,
                allowedMentions: { repliedUser: true }
            });
            return;
        }

        if (number === lastNumber + 1) {
            lastNumber = number;
            lastUserId = message.author.id;
            await message.react('1277603930733412474').catch(console.error);
        } else {
            await message.reply({
                content: `Yanlış sayı! Doğru sayı **${lastNumber + 1}** idi. Oyun sıfırlanmayacak.`,
                allowedMentions: { repliedUser: true }
            });
            await message.react('1277604016313995305').catch(console.error);
        }
    }
};
