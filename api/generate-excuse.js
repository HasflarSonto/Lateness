export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { lateness, alcohol, timeOfDay, importance, weather, day, hungover } = req.body;

        // Build a fun prompt based on the context
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

        const contextString = contextParts.length > 0
            ? `Context: ${contextParts.join(', ')}.`
            : '';

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
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 150,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Anthropic API error:', errorData);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const excuse = data.content[0].text.trim();

        return res.status(200).json({ excuse });
    } catch (error) {
        console.error('Error generating excuse:', error);
        return res.status(500).json({ error: 'Failed to generate excuse' });
    }
}
