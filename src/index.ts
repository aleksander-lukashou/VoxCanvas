import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Env }>();
app.use(cors());

const DEFAULT_INSTRUCTIONS = `You are web design assistant with that has some tools installed.

Core Web Design Tools:
- You can view and modify the page HTML structure
- You can change colors, text styles, and element positioning
- You can create, reorder, and delete elements (paragraphs, buttons, inputs, etc.)

Advanced Layout Capabilities:
- You can create responsive layouts with column and grid systems
- You can design layouts that adapt to different screen sizes
- You can position elements precisely within layouts

Image Generation:
- You can generate images based on text descriptions using DALL-E
- You can create image placeholders when generation is not available
- You can customize image sizes, styles and quality

When asked to create a website, use these capabilities to build responsive, visually appealing layouts.
Focus on creating a professional design that looks good on all devices.
Be concise in your responses and focus on implementation.
`;

// Learn more: https://platform.openai.com/docs/api-reference/realtime-sessions/create
app.get('/session', async (c) => {
	const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
		method: "POST",
		headers: {
		  "Authorization": `Bearer ${c.env.OPENAI_API_KEY}`,
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  model: "gpt-4o-realtime-preview-2024-12-17",
		  instructions: DEFAULT_INSTRUCTIONS,
		  voice: "ash",
		}),
	  });
	  const result = await response.json();
	  return c.json({result});
});

// Image generation endpoint
app.post('/api/generate-image', async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, size, quality, style } = body;
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }
    
    // Call OpenAI's DALL-E API to generate an image
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size || '1024x1024',
        quality: quality || 'standard',
        style: style || 'vivid',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as { error?: { message: string } };
      console.error('OpenAI API error:', errorData);
      return c.json({ 
        error: errorData.error?.message || 'Failed to generate image',
        details: errorData
      }, response.status as 400 | 401 | 403 | 429 | 500);
    }
    
    const result = await response.json() as { data: [{ url: string }] };
    return c.json({ url: result.data[0].url });
    
  } catch (error: any) {
    console.error('Image generation error:', error);
    return c.json({ 
      error: error.message || 'An unexpected error occurred',
    }, 500);
  }
});

export default app;
