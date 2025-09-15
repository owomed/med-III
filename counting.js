let lastNumber = 0;
let lastUserId = null;
const countingChannelId = '1410691761386426499';
const userCounts = new Map(); // Kullanıcıların ardışık yazma sayısını tutmak için

// Emoji ve uyarı mesajları sabitleri
const correctEmoji = 'med_yess:1417077623951065160';
const wrongEmoji = 'med_no:1417078331168972821';

const wrongNumberReplies = [
    'Yanlış sayı! Doğru sayı **{number}** idi. Oyun sıfırlanmayacak.',
    'Hata! Bu sayı sırası değil. Doğru sayı: **{number}** olacaktı. Saymaya devam.',
    'Ah, olmadı! Doğru sayı **{number}** olmalıydı. Oyun devam ediyor.',
    'Şansını bir dahaki sefere dene! Doğru sayı **{number}**. Baştan başlamıyoruz.'
];

// Sayı ve OwO formatını yakalamak için Regex
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
            // Son 100 mesajı getir
            const messages = await channel.messages.fetch({ limit: 100 });
            
            // Son mesajlardan geriye doğru tarayarak son geçerli sayıyı bul
            for (const message of messages.values()) {
                const content = message.content.trim();
                const match = content.match(numberRegex);
                const number = match ? parseInt(match[1], 10) : parseInt(content, 10);
                
                // Mesaj geçerli bir sayı içeriyorsa
                if (!isNaN(number)) {
                    lastNumber = number;
                    lastUserId = message.author.id;

                    // Son 20 mesajı tarayarak art arda sayma sayısını bulma
                    const userMessages = messages.filter(msg => msg.author.id === lastUserId);
                    userCounts.set(lastUserId, userMessages.size);
                    
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

        // Mesajın sadece sayı veya "owo sayı" formatında olup olmadığını kontrol et
        if (isNaN(number) || (match && content !== match[0])) {
            await message.reply({
                content: 'Lütfen sadece bir sayı veya "owo <sayı>" şeklinde bir mesaj girin.',
                allowedMentions: { repliedUser: true }
            });
            return;
        }
        
        // Kullanıcıların ardışık yazma sayısını güncelle
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
            // Farklı bir kişi yazdıysa sayacı sıfırla ve o kişiyi kaydet
            userCounts.clear();
            userCounts.set(message.author.id, 1);
        }

        // Sayı doğruysa
        if (number === lastNumber + 1) {
            lastNumber = number;
            lastUserId = message.author.id;
            await message.react(correctEmoji).catch(console.error);
        } else {
            // Sayı yanlışsa
            const randomReply = wrongNumberReplies[Math.floor(Math.random() * wrongNumberReplies.length)];
            await message.reply({
                content: randomReply.replace('{number}', lastNumber + 1),
                allowedMentions: { repliedUser: true }
            });
            await message.react(wrongEmoji).catch(console.error);
        }
    }
};
