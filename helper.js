const fs = require('fs/promises'); // 'fs/promises' modülü, asenkron fonksiyonları içerir
const path = require('path');

const filePath = path.join(__dirname, 'afkData.json');

// AFK verisini asenkron olarak okur
async function readAFKData() {
    try {
        // Dosya var mı kontrol et, yoksa oluştur
        await fs.access(filePath);
    } catch (error) {
        // Dosya yoksa boş bir JSON nesnesi oluştur
        await fs.writeFile(filePath, JSON.stringify({}));
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Okuma veya parse etme hatası olursa
        console.error('AFK verisi okunurken veya çözümlenirken hata oluştu:', error);
        return {}; // Boş bir nesne döndürerek botun çökmesini önle
    }
}

// AFK verisini asenkron olarak yazar
async function writeAFKData(data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('AFK verisi yazılırken hata oluştu:', error);
    }
}

module.exports = { readAFKData, writeAFKData };
