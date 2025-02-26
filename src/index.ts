import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Env }>();
app.use(cors());

const DEFAULT_INSTRUCTIONS = `You are helpful assistant and have some tools installed.
You can get the HTML of the page.
You can change the background color of the page or text color, text and the order of the elements.
You can create new elements on the page: paragraphs, buttons, and inputs.
You can delete elements from the page.
No yapping.
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


export default app;
