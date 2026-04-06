/**
 * Calls OpenAI to guess a cause + fix from ticket text.
 * If OPENAI_API_KEY is missing, returns null (ticket still saves).
 */
async function getTicketInsights(title, description) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You help triage software support tickets. Reply with ONLY valid JSON: {"possibleCause":"...","suggestedFix":"..."}. Be concise.',
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nDescription:\n${description}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return {
      possibleCause: String(parsed.possibleCause || '').slice(0, 2000),
      suggestedFix: String(parsed.suggestedFix || '').slice(0, 2000),
    };
  } catch (err) {
    console.error('[openai] insight error:', err.message);
    return null;
  }
}

module.exports = { getTicketInsights };
