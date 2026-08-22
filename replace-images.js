const fs = require('fs');

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/b/b7/Arijit_Singh_performance_at_Chandigarh_2025.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e2/Diljit_Dosanjh.jpg',
  'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ColdplayWembley120925_%28cropped%29.jpg/1280px-ColdplayWembley120925_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Zakir_khan_2.jpg/1280px-Zakir_khan_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg/1280px-Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg',
  'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Ed_Sheeran-6886_%28cropped_2%29.jpg/960px-Ed_Sheeran-6886_%28cropped_2%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg/960px-Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg'
];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (let i = 0; i < images.length; i++) {
    // We match the old Unsplash URLs in order, or we can just replace them by matching the id: '{i+1}' block
    const idStr = `id: '${i + 1}',`;
    const parts = content.split(idStr);
    if (parts.length > 1) {
      // Find 'image: ' and replace the string after it
      parts[1] = parts[1].replace(/image:\s*'.*?'/, `image: '${images[i]}'`);
      content = parts.join(idStr);
    }
  }
  fs.writeFileSync(filePath, content);
}

updateFile('artifacts/paradox-ticket/src/App.tsx');
updateFile('artifacts/api-server/src/routes/ticketing.ts');

console.log("Images replaced!");
