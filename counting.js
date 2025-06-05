
let lastNumber = 0;
let lastValidMessageId = null; // En son doğru sayıyı içeren mesajın ID'si
let userTimes = {}; // Kullanıcı bazında zaman damgaları
const countingChannelId = '1277619029804060692'; // Sayı sayma kanalının ID'sini buraya ekleyin

module.exports = {
  initializeLastNumber: async (channel) => {
    // Kanaldaki son iki mesajı kontrol et ve en son doğru sayıyı bul
    const messages = await channel.messages.fetch({ limit: 10 }); // Son 10 mesajı getir
    for (const message of messages.values()) {
      const content = message.content.trim();
      const number = parseInt(content.replace(/owo\s*/i, ''), 10);

      if (!isNaN(number)) {
        lastNumber = number;
        lastValidMessageId = message.id;
        break;
      }
    }
  },
  
  handleCounting: async (message) => {
    if (message.channel.id !== countingChannelId) return;

    const currentTime = Date.now();
    const messageContent = message.content.trim();
    const number = parseInt(messageContent.replace(/owo\s*/i, ''), 10);

    if (isNaN(number)) return; // Eğer sayı değilse işlem yapma

    // Kullanıcının son mesaj zamanını kontrol edin
    const lastUserTime = userTimes[message.author.id] || 0;
    const timeSinceLastMessage = currentTime - lastUserTime;

    if (timeSinceLastMessage < 11000) {
      await message.react('<:med_no:1277604016313995305>'); // Yanlış sayı veya zaman
      return;
    }

    // Eğer yazılan sayı beklenen sayıya eşitse
    if (number === lastNumber + 1) {
      await message.react('<:med_yes:1277603930733412474>'); // Doğru sayı
      await message.pin();
      lastNumber = number;
      lastValidMessageId = message.id;
      userTimes[message.author.id] = currentTime; // Kullanıcının zaman damgasını güncelle
    } else {
      await message.react('<:med_no:1277604016313995305>'); // Yanlış sayı
    }
  },
  countingChannelId
};
