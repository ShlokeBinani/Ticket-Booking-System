const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const chatbotFind = `const [messages, setMessages] = useState<any[]>([
    { role: 'bot', text: 'Hey! I am Dot. I might not be as great as Jarvis, but I can certainly help you make your night a remarkable one!' }
  ]);
  const [, setLocation] = useLocation();`;

const chatbotReplace = `const [messages, setMessages] = useState<any[]>([]);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setMessages([{ role: 'bot', text: \`Hey! I am Dot. I might not be as great as Jarvis, but I can certainly help you make your night a remarkable one\${user ? ', ' + user.name.split(' ')[0] : ''}!\` }]);
  }, [user?.email]);`;

app = app.replace(chatbotFind, chatbotReplace);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Chatbot state fixed!");
