import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createGridDBClient } from './lib/griddb.js';
import { generateRandomID } from "./lib/randomId.js";
const app = express();
const port = process.env.PORT || 3001;
const dbConfig = {
    griddbWebApiUrl: process.env.GRIDDB_WEBAPI_URL || '',
    username: process.env.GRIDDB_USERNAME || '',
    password: process.env.GRIDDB_PASSWORD || '',
};
const dbClient = createGridDBClient(dbConfig);
dbClient.createContainer();
app.use(cors());
app.use(express.json());
// Serve static files from Vite build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const SYSTEM_PROMPT = `You are a sentiment‑analysis classifier for Amazon user‑review records. You will receive one JSON object that contains the fields "title" and "text" (and sometimes "rating" which you must ignore). Your task:\n1. Read the natural‑language content (title + text).\n2. Predict the sentiment label and an estimated star rating without looking at any numeric "rating" field.\n3. Respond ONLY with a JSON object in this schema:\n{\n  "label": "positive | neutral | negative",\n  "predicted_rating": 1 | 2 | 3 | 4 | 5,\n  "confidence": 0-1\n}\nMapping rule (aligned to the Amazon Reviews dataset):\n• 1–2 stars ⇒ negative\n• 3 stars   ⇒ neutral\n• 4–5 stars ⇒ positive\nIf the review text is empty, off‑topic, or nonsense, return:\n{"label":"neutral","predicted_rating":3,"confidence":0.0}\nNever add commentary or extra keys.`;
const FEW_SHOTS = [
    {
        role: 'user',
        content: JSON.stringify({
            title: 'Rock‑solid mount',
            text: "I've tried dozens of phone mounts—this one finally stays put on bumpy roads. Five minutes to install and rock‑solid!",
        }),
    },
    {
        role: 'assistant',
        content: '{"label":"positive","predicted_rating":5,"confidence":0.96}',
    },
    {
        role: 'user',
        content: JSON.stringify({
            title: 'Broke in a week',
            text: "Looks nice, but the zipper broke after one week and Amazon wouldn't replace it.",
        }),
    },
    {
        role: 'assistant',
        content: '{"label":"negative","predicted_rating":1,"confidence":0.93}',
    },
    {
        role: 'user',
        content: JSON.stringify({
            title: 'Meh',
            text: 'These were lightweight and soft but much too small for my liking. I would have preferred two of these together to make one loc.',
        }),
    },
    {
        role: 'assistant',
        content: '{"label":"neutral","predicted_rating":3,"confidence":0.55}',
    },
];
// API route remains
app.post('/api/sentiment', async (req, res) => {
    const { title, text } = req.body;
    if (!title && !text) {
        return res.status(400).json({ error: 'Please supply at least a review title or body text.' });
    }
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...FEW_SHOTS,
                {
                    role: 'user',
                    content: JSON.stringify({ title, text }),
                },
            ],
        });
        const raw = completion.choices[0].message.content?.trim() || '{}';
        try {
            /** Save the data into GridDB database */
            // Parse sentiment from model output
            const parsed = JSON.parse(raw);
            console.log(parsed);
            const reviewData = {
                id: generateRandomID(),
                title,
                review: text,
                sentiment: JSON.stringify(parsed),
            };
            await dbClient.insertData({ data: reviewData });
            res.json(JSON.parse(raw));
        }
        catch {
            res.json({ error: 'Model returned invalid JSON', raw });
        }
    }
    catch (error) {
        console.error('[Sentiment API] Error:', error);
        let errorMessage = 'Failed to analyze sentiment.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage });
    }
});
// Catch-all: serve index.html for any non-API route (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
