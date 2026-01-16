import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

// Load API key from .env file if it exists
let ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
        if (match) {
            ANTHROPIC_API_KEY = match[1].trim();
        }
    }
} catch (e) {
    console.log('No .env file found, using environment variable');
}

async function handleChatAPI(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
        try {
            const { message, history } = JSON.parse(body);

            if (!ANTHROPIC_API_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API key not configured' }));
                return;
            }

            const systemPrompt = `You are Antonio Li, a Columbia University student (Class of 2028). You're chatting casually with someone who found your "How Late Will I Be?" website.

ABOUT YOU:
- Studying Architecture & Computer Science at Columbia College
- Research Fellow at Laidlaw Foundation working on LLMs for 3D object generation
- Research Fellow at Columbia Data Science Institute working on database visualization
- Co-founded Truely (AI detection software for interviews) at Founders Inc in SF
- Previously worked at Columbia Space Initiative as a Software Engineer
- Did an internship at L&A Group in Shenzhen working on parametric algorithms for urban greenery
- Took architecture at Cornell summer program

YOUR PROJECTS:
- Fyros: "Fitbit for your Brain" - a brain monitoring wearable
- Truely: Anti-cheating software for interviews ("Hire the best candidate, not the best AI")
- Desert Bulwark: Architectural submission for Buildner Microhome Competition
- Procedurally Generated Firebreaks: Algorithm using landfire.gov data to simulate wildfires

YOUR PUBLICATIONS:
- "A Formalism and Library for Database Visualization" (Arxiv, Apr 2025)
- "AI Algorithm for the Generation of Three-Dimensional Accessibility Ramps" (Arxiv, Sep 2023)

YOUR PATENT:
- "A computer vision analysis method and system for urban public space design" (CN115600267B)

YOUR SKILLS: Python, Java, JavaScript, Rhino 3D, Grasshopper, AutoCAD, SOLIDWORKS, LLMs, 3D CAD, Parametric Design

YOUR PERSONALITY:
- Casual, friendly, uses lowercase a lot
- Says "yo", "lol", "ngl", "tbh", "haha", "lowkey"
- Self-aware about being chronically late to everything
- Enthusiastic about projects but not braggy
- Short to medium responses, conversational
- You have a cat that you love

If someone asks about hiring or working together, be open to it and mention your LinkedIn: linkedin.com/in/antonio-li-/`;

            const messages = [
                ...(history || []).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: 'user', content: message }
            ];

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 300,
                    system: systemPrompt,
                    messages: messages
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ response: data.content[0].text }));
        } catch (error) {
            console.error('Chat error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to generate response' }));
        }
    });
}

async function handleExcuseAPI(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
        try {
            const { lateness, alcohol, timeOfDay, importance, weather, day, hungover } = JSON.parse(body);

            if (!ANTHROPIC_API_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API key not configured. Create a .env file with ANTHROPIC_API_KEY=your_key' }));
                return;
            }

            // Build context for the excuse
            const contextParts = [];
            if (timeOfDay === 'morning') contextParts.push("it's way too early");
            if (timeOfDay === 'night') contextParts.push("it's late at night");
            if (hungover === 'yes') contextParts.push("they're definitely hungover");
            if (hungover === 'maybe') contextParts.push("they might be a little hungover");
            if (weather === 'bad') contextParts.push("the weather is terrible outside");
            if (day === 'weekend') contextParts.push("it's the weekend");
            if (day === 'friday') contextParts.push("it's Friday");
            if (importance === 'optional') contextParts.push("the event is pretty optional anyway");
            if (importance === 'casual') contextParts.push("it's just a casual hangout");
            if (alcohol) contextParts.push("there's alcohol at the event (so they're more motivated)");

            const contextString = contextParts.length > 0 ? `Context: ${contextParts.join(', ')}.` : '';

            const prompt = `You are a chronically late person who needs to text their friend an excuse for why you're going to be ${lateness} minutes late to an event.

${contextString}

Generate a single creative, funny, and slightly absurd excuse text message. The excuse should:
- Be written as a casual text message (no quotes needed)
- Be 1-2 sentences max
- Be creative and unexpected, not a typical "traffic" excuse
- Have a hint of truth that makes it almost believable
- Be funny but not mean-spirited

Just respond with the excuse text, nothing else. No quotes around it.`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 150,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const excuse = data.content[0].text.trim();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ excuse }));
        } catch (error) {
            console.error('Error generating excuse:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to generate excuse' }));
        }
    });
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Handle API routes
    if (req.url === '/api/generate-excuse' && req.method === 'POST') {
        return handleExcuseAPI(req, res);
    }

    if (req.url === '/api/chat' && req.method === 'POST') {
        return handleChatAPI(req, res);
    }

    // Serve static files
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    try {
        const content = fs.readFileSync(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            res.writeHead(500);
            res.end('Server Error');
        }
    }
});

server.listen(PORT, () => {
    console.log(`
🕐 How Late Will I Be? is running!

   Local: http://localhost:${PORT}

${ANTHROPIC_API_KEY ? '✅ Anthropic API key loaded' : '⚠️  No API key found - excuses will use fallbacks\n   Create a .env file with: ANTHROPIC_API_KEY=your_key'}

Press Ctrl+C to stop
`);
});
