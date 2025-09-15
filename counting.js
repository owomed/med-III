let lastNumber = 0;
let lastUserId = null;
const countingChannelId = '1410691761386426499';
const userCounts = new Map();

const wrongNumberReplies = [
    'Yanlış sayı! Doğru sayı **{number}** idi. Oyun sıfırlanmayacak.',
    'Hata! Bu sayı sırası değil. Doğru sayı: **{number}** olacaktı. Saymaya devam.',
    'Ah, olmadı! Doğru sayı **{number}** olmalıydı. Oyun devam ediyor.',
    'Şansını bir dahaki sefere dene! Doğru sayı **{number}**. Baştan başlamıyoruz.'
];

// Sayı ayıklama regex'i. "owo" gibi ifadeleri temizler ve sayıyı bulur.
const numberRegex = /owo\s*(\d+)/i; 

module.exports = {
    countingChannelId: countingChannelId,

    // Bot açıldığında son sayıyı ve son kullanıcıyı bulma fonksiyonu
    async initializeLastNumber(client) {
        const channel = client.channels.cache.get(countingChannelId);
        if (!channel) {
            console.error('Sayı sayma kanalı bulunamadı.');
            return;
        }

        try {
            // Son 50 mesajı getir
            const messages = await channel.messages.fetch({ limit: 50 });
            for (const message of messages.values()) {
                const content = message.content.trim();
                const match = content.match(numberRegex);
                const number = match ? parseInt(match[1], 10) : parseInt(content, 10);

                if (!isNaN(number)) {
                    lastNumber = number;
                    lastUserId = message.author.id;
                    console.log(`Bot yeniden başlatıldı. Son doğru sayı: ${lastNumber} ve son yazan kişi ${message.author.username}.`);
                    return; // İlk geçerli sayıyı bulur bulmaz döngüden çık
                }
            }
        } catch (error) {
            console.error('Son mesajları bulurken hata oluştu:', error);
        }
    },

    async handleCounting(message) {
        const content = message.content.trim();
        const match = content.match(numberRegex);
        const number = match ? parseInt(match[1], 10) : parseInt(content, 10);

        if (isNaN(number)) {
            await message.reply({
                content: 'Lütfen sadece bir sayı veya "owo <sayı>" şeklinde bir mesaj girin.',
                allowedMentions: { repliedUser: true }
            });
            return;
        }

        const currentCount = userCounts.get(message.author.id) || 0;
        
        if (message.author.id === lastUserId) {
            userCounts.set(message.author.id, currentCount + 1);

            if (currentCount >= 20) {
                await message.reply({
                    content: `Hey, art arda **20** defadan fazla sayı sayamazsın! Başka biri yazsın. Son sayı **${lastNumber}** olarak kalacak.`,
                    allowedMentions: { repliedUser: true }
                });
                return;
            }
        } else {
            userCounts.clear();
            userCounts.set(message.author.id, 1);
        }

        if (number === lastNumber + 1) {
            lastNumber = number;
            lastUserId = message.author.id;
            await message.react('1277603930733412474').catch(console.error);
        } else {
            const randomReply = wrongNumberReplies[Math.floor(Math.random() * wrongNumberReplies.length)];
            await message.reply({
                content: randomReply.replace('{number}', lastNumber + 1),
                allowedMentions: { repliedUser: true }
            });
            await message.react('1277604016313995305').catch(console.error);
        }
    }
};
