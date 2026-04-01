const https = require('https');
require('dotenv').config();

function getModels(version) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`${version} failed: ${res.statusCode} ${res.statusMessage} - ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function listModels() {
  const versions = ['v1', 'v1beta'];
  for (const v of versions) {
    console.log(`--- Checking ${v} ---`);
    try {
      const result = await getModels(v);
      result.models.forEach(m => console.log(m.name));
    } catch (err) {
      console.error(err.message);
    }
  }
}

listModels();
