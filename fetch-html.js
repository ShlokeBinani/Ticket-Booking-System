const https = require('https');

const queries = [
  'Arijit_Singh',
  'Diljit_Dosanjh',
  'Jawan_(film)',
  'Kalki_2898_AD',
  'Coldplay',
  'Zakir_Khan_(comedian)',
  'Sunburn_Festival',
  'Animal_(2023_Indian_film)',
  'Ed_Sheeran',
  'Anubhav_Singh_Bassi'
];

async function fetchImages() {
  for (const q of queries) {
    const url = `https://en.wikipedia.org/wiki/${q}`;
    await new Promise(resolve => {
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const match = data.match(/<meta property="og:image" content="(.*?)"/);
          console.log(`${q}: ${match ? match[1] : 'NO IMAGE'}`);
          resolve();
        });
      });
    });
  }
}

fetchImages();
