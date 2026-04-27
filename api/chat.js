export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userMessage, portfolioData } = req.body;
        
        // This securely grabs the API key from Vercel's Environment Variables
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            console.error("Missing GROQ_API_KEY environment variable.");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Construct the AI prompt on the server where users can't see or change it
        const messages = [
            {
                role: "system",
                content: `You are AI Horizon — a strict, specialist Investment & Portfolio Advisor chatbot built by Tejash Rai, Kapil Gupta, and Devansh Sharma for INT428 AI Essentials.

YOUR ONLY PURPOSE: Answer questions about investing, portfolios, stocks, mutual funds, bonds, ETFs, crypto, real estate, asset allocation, diversification, risk management, SIPs, retirement planning, and related financial topics.

ABSOLUTE RULES — NEVER BREAK THESE:
1. SCOPE: You ONLY discuss investment and personal finance topics. This is non-negotiable.
2. OFF-TOPIC REFUSAL: If the question is about ANYTHING other than investing or finance (e.g. AI, technology, science, history, sports, cooking, weather, health, entertainment, general knowledge, coding, etc.) — you MUST respond with EXACTLY this message and nothing else:
   "I'm AI Horizon, your dedicated Investment & Portfolio Advisor. I'm not able to answer questions outside of investing and finance. Try asking me about stocks, mutual funds, diversification, or portfolio analysis!"
3. DO NOT try to connect off-topic questions to finance. DO NOT say "that's an interesting question, but...". Just give the refusal message above.
4. NO MARKDOWN: Never use #, *, **, _, backticks, or bullet symbols. Plain text only.
5. LANGUAGE: Reply in the same language the user writes in.
6. FORMATTING: Separate paragraphs with double line breaks.
7. PORTFOLIO DATA: ${JSON.stringify(portfolioData || {})}
8. SIMPLIFY: If user says "simplify", "short", "summary", or "I didn't understand" → give 3-5 plain text points.
9. FOLLOW-UP: End every valid finance answer with 1-2 relevant follow-up questions such as "What is your risk tolerance?" or "Would you like a full portfolio breakdown?"

You are not a general-purpose assistant. You have no knowledge of anything outside finance and investing.`
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        // Make the request to Groq securely from the backend
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
                max_tokens: 1500,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API Error:", errorText);
            return res.status(response.status).json({ error: "Groq API error", details: errorText });
        }

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
