const { readAFKData, writeAFKData } = require('../helper');

module.exports = {
    name: 'afk',
    description: 'AFK moduna geçmenizi sağlar.',
    async execute(message, args) {
        const reason = args.join(' ') || 'Sebep belirtilmedi';
        const nickname = message.member.nickname || message.author.username;

        try {
            let afkData = readAFKData();
            afkData[message.author.id] = { reason: reason, nickname: nickname };
            writeAFKData(afkData);

            await message.member.setNickname(`[AFK] ${nickname}`);
            message.reply({
                content: `\`\`\`diff\n- ${reason ? `O şu anda "${reason}" sebebiyle AFK, isterseniz daha sonra tekrar deneyin.` : 'O şu anda AFK, sebep belirtilmedi. Daha sonra tekrar deneyebilirsiniz.'}\n\`\`\``,
                allowedMentions: { repliedUser: false },
            }).then(msg => {
                msg.react('<a:med_owo_wawe:1362107523947171931>>');
            });
        } catch (error) {
            console.error('AFK komutu hata:', error);
            message.reply('AFK moduna geçerken bir hata oluştu.');
        }
    },
    handleMessages(message) {
        let afkData = readAFKData();
        if (!afkData[message.author.id]) return;

        const userData = afkData[message.author.id];
        delete afkData[message.author.id];
        writeAFKData(afkData);

        if (message.content) {
            message.member.setNickname(userData.nickname).catch(console.error);
            message.reply({
                content: `\`\`\`diff\n+ AFK modundan çıktınız. Hoş geldiniz!\n\`\`\``,
                allowedMentions: { repliedUser: false },
            });
        }
    },
    checkMention(message) {
        let afkData = readAFKData();
        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(user => {
                if (afkData[user.id]) {
                    const userData = afkData[user.id];
                    message.reply({
                        content: `\`\`\`fix\n- ${user.username} şu anda "${userData.reason}" sebebiyle AFK. Daha sonra tekrar deneyin.\n\`\`\``,
                        allowedMentions: { repliedUser: false },
                    }).then(msg => {
                        msg.react('<a:med_owo_wawe:1362107523947171931>');
                    });
                }
            });
        }
    },
};
