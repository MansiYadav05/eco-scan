# Eco Scan

Eco Scan is an AI-powered waste classification web app designed for Indian household and municipal waste segregation. It helps users identify common waste items, classify them into proper disposal streams, and learn how to dispose of them responsibly according to Indian Solid Waste Management Rules 2016 and relevant local waste guidance.

The app supports both text-based queries and image uploads, using Gemini 2.5 Flash for multimodal classification with a local rule-based fallback when the API key is unavailable.

## Features

- Waste classification for common Indian household items
- Categories include Wet, Dry, Recyclable, E-Waste, Harmful, and Hazardous waste streams
- Text input and image upload support
- Drag-and-drop and camera/gallery upload flow
- Disposal instructions and eco-tips for each item
- History tracking and eco score for logged-in users
- Responsive React UI with route-based pages for classify, history, about, and login

## Tech Stack

- React + TypeScript + Vite for the frontend
- Express server for API routing and model integration
- Google Gemini 2.5 Flash for AI-based classification
- Local rule engine fallback for offline or API-limited scenarios
- Tailwind-inspired styling and motion-based UI effects

## Project Structure

- src/App.tsx — app routing and layout
- src/pages/ — page views including classification, history, login, and about pages
- src/components/ — reusable UI cards and navigation
- src/services/classifier.ts — client-side API call wrapper
- src/context/AppContext.tsx — app state and history tracking
- src/utils/imageHelper.ts — image compression and sample image utilities
- server.ts — Express server and Gemini classification logic

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A valid Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:

   npm install

### Environment Setup

Create a local environment file and add your Gemini API key:

GEMINI_API_KEY=your_api_key_here

If you are running on Windows PowerShell, you can also set it in the terminal before starting:

$env:GEMINI_API_KEY="your_api_key_here"

### Run the App

Start the development server:

npm run dev

The app will run on:

http://localhost:3000

## Available Scripts

- npm run dev — starts the Vite + Express development server
- npm run build — creates a production build
- npm run start — runs the built server
- npm run lint — runs TypeScript checking

## How It Works

1. The user enters a waste item description or uploads an image.
2. The frontend sends the request to the server API.
3. The server calls Gemini 2.5 Flash with the item description and optional image.
4. The model classifies the item into the relevant waste stream.
5. The app returns disposal guidance, explanation, and a sustainability tip.
6. If Gemini is unavailable, the app falls back to a local Indian SWM rule engine.

## Waste Categories

Eco Scan focuses on practical segregation categories used in India:

- Wet waste
- Dry waste
- Recyclable waste
- E-Waste
- Harmful / Hazardous waste

## Notes

- The project is tailored to Indian waste disposal norms and common local waste examples.
- Image input is optimized for household, packaging, and electronic waste recognition.
- The app includes a local fallback engine so users still get useful guidance even without a live model key.

## License

This project is for educational and demonstration use. Update or extend it as needed for your own deployment or production environment.
