const Discord = require('discord.js');

module.exports = {
    name: '3ping',
    description: 'Botun gecikmesini hesaplar',
    execute(client, message, args) {
        message.reply('`Ping hesaplanıyor...`').then(sentMessage => {
            const ping = sentMessage.createdTimestamp - message.createdTimestamp;
            const apiPing = Math.round(client.ws.ping);

            const embed = new Discord.MessageEmbed()
                .setTitle('Pong!')
                .setDescription(`Botun gecikmesi: **${ping}ms**\nAPI gecikmesi: **${apiPing}ms**`)
                .setColor('#00ff00')
                .setTimestamp();

            sentMessage.edit('', embed);
        });
    }
};
