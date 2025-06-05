const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'afkData.json');

function readAFKData() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

function writeAFKData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readAFKData, writeAFKData };
