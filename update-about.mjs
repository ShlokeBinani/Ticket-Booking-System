import fs from 'fs';
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

if (!code.includes('function About()')) {
  code = code.replace(/function Auth\(\) \{/, `function About() { return <Shell><section className="bg-primary text-primary-foreground"><div className="mx-auto max-w-[1440px] px-5 py-28 md:px-10 md:py-40"><span className="mono-label text-[10px] text-accent">About Paradox Ticket</span><h1 className="display-font mt-6 max-w-5xl text-8xl leading-[.75] md:text-[11rem]">A ticket can<br /><i>change the night.</i></h1><p className="mt-12 max-w-lg text-lg leading-8 text-primary-foreground/65">Paradox is a small, stubbornly human ticketing platform for cinema, music, and the beautiful in-between.</p></div></section><section className="mx-auto grid max-w-[1180px] gap-12 px-5 py-24 md:grid-cols-2 md:px-10"><h2 className="display-font text-6xl leading-[.85]">Less queue.<br />More ceremony.</h2><div className="space-y-5 text-sm leading-7 text-foreground/65"><p>Some nights begin hours before the lights go down. You picture the room and wonder which seat has the best view.</p><p>Paradox keeps that feeling intact: clear times, honest availability, and no mystery fees at the final step.</p></div></section></Shell>; }
function Auth() {`);
  fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
  console.log('App.tsx updated with About');
}
