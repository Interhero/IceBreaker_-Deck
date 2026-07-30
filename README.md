# Icebreaker Web App Simulator

This is a beautiful, interactive digital card game based on the physical **Icebreaker Starter Pack** by BestSelf Co. It features dynamically generated cards written by Google Gemini, preventing duplicate prompts and ensuring an infinite variety of conversation starters.

## Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **Gemini API Key** (you can get a free key from [Google AI Studio](https://aistudio.google.com/))

## Setup Instructions

### 1. Configure the Environment
In the root directory, copy `.env.example` to `.env` (or rename it):
```bash
cp .env.example .env
```
Open `.env` and replace `your_gemini_api_key_here` with your actual Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
```

### 2. Install Dependencies
Run the following command in your terminal to install the server dependencies:
```bash
npm install
```

### 3. Start the Server
Start the local server by running:
```bash
npm start
```
This will spin up the server at `http://localhost:3000`.

### 4. Play the Game
Open your web browser and navigate to:
[http://localhost:3000](http://localhost:3000)

* Click on the category chips at the top to toggle categories on/off.
* Tap the card or click **Draw a card** to flip it and reveal a prompt.
* A loading indicator will spin if the app is waiting for the AI to generate a brand new card.

## How Prompt Anti-Redundancy Works
1. **Model Filtering:** The backend passes the list of recently seen prompts (`history`) for the selected category to Gemini, instructing it specifically to avoid repeating them or writing close variations.
2. **Client-Side Deduplication:** The client side tracks a `seenSet` of normalized prompts. If a generated prompt matches any previously seen text, it is filtered out immediately before entering the buffer, ensuring completely unique cards are drawn.
3. **Offline Fallback:** If the API key is not configured or there is no network connection, the application will degrade gracefully and draw prompts from local seed lists.
