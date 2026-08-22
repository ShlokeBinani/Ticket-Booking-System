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
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${q}&pithumbsize=800&format=json`;
    await new Promise(resolve => {
      https.get(url, { headers: { 'User-Agent': 'ParadoxTicketBot/1.0 (contact@example.com)' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const page = Object.values(pages)[0];
          console.log(`${q}: ${page.thumbnail ? page.thumbnail.source : 'NO IMAGE'}`);
          resolve();
        });
      });
    });
  }
}

fetchImages();
