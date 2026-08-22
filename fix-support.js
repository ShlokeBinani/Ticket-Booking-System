const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

app = app.replace(
  /const \{ data: events \} = useListEvents\(\{ query: \{ queryKey: getListEventsQueryKey\(\) \} \}\);/,
  "const { data: events } = useListEvents(undefined, { query: { queryKey: getListEventsQueryKey(undefined) } });"
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Support component useListEvents fixed!");
