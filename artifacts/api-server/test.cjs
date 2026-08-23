const { eq } = require('drizzle-orm'); try { eq(undefined, 'foo'); console.log('Did not throw'); } catch(e) { console.log('Threw:', e.message); } process.exit(0);
