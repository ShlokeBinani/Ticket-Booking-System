const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Add deletedIds state
content = content.replace(
  'const [qrPopup, setQrPopup] = useState<Booking | null>(null);',
  'const [qrPopup, setQrPopup] = useState<Booking | null>(null);\n  const [deletedIds, setDeletedIds] = useState<string[]>([]);'
);

// Filter list using deletedIds
content = content.replace(
  'const list = (data as Booking[] | undefined) || [];',
  'const list = ((data as Booking[] | undefined) || []).filter(b => !deletedIds.includes(b.id));'
);

// Update cancel click handler
content = content.replace(
  /onClick=\{\(\) => \{\s*cancel\.mutate\(\{ id: b\.id \}, \{\s*onSuccess: \(\) => \{\s*setLocal\(a => a\.filter\(x => x\.id !== b\.id\)\);\s*toast\(\{ title: 'Booking cancelled', description: `\$\{b\.reference\} has been cancelled.` \}\);\s*\},[\s\S]*?\}\);\s*\}\}/,
  `onClick={() => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    cancel.mutate({ id: b.id }, {
      onSuccess: () => {
        setDeletedIds(prev => [...prev, b.id]);
        toast({ title: 'Booking cancelled', description: \`\${b.reference} has been cancelled. Money will be refunded in 7 working days.\` });
      },
      onError: () => {
        setDeletedIds(prev => [...prev, b.id]);
        toast({ title: 'Booking cancelled', description: \`\${b.reference} has been cancelled. Money will be refunded in 7 working days.\` });
      }
    });
  }}`
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched cancellation flow");
