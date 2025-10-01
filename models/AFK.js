const mongoose = require('mongoose');

// AFK verileri için bir şema oluştur
const afkSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true // Her kullanıcının sadece bir AFK kaydı olabilir
    },
    reason: {
        type: String,
        default: 'Sebep belirtilmedi'
    },
    guildId: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now // AFK olma zamanı
    }
});

// Modeli dışa aktar
module.exports = mongoose.model('AFK', afkSchema);
