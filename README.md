# Client Side Tool Calling with the OpenAI WebRTC Realtime API

This project is a [Cloudflare Workers](https://developers.cloudflare.com) app using [Hono](https://honojs.dev) to relay the [OpenAI Realtime API](https://platform.openai.com/docs/api-reference/realtime) over WebRTC. The main files are just static assets.

## Project Overview

This application enables real-time web page manipulation through voice commands using GPT-4o Realtime. The AI assistant can:

- **Style the page**: Change colors, modify text styles
- **Create elements**: Add text, buttons, inputs, dropdowns
- **Manipulate elements**: Insert, move, reorder, or delete elements
- **Debug**: List elements and get element information

All created elements receive unique IDs for easy reference in subsequent operations.

## Develop

Copy [.dev.vars.example](./.dev.vars.example) to `.dev.vars` and fill out your OpenAI API Key.

Install your dependencies

```bash
npm install
```

Run local server

```bash
npm run dev
```

In the separate terminal
```bash
npx wrangler dev
```