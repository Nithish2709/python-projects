# NPL Based Real Time Translator and AI Assistant

A sophisticated, Claude-inspired web application that combines real-time translation, image OCR, and an AI chat assistant. This project uses a FastAPI backend powered by Google's Gemini models and a React frontend featuring a highly polished, responsive UI with local history tracking.

## Features

- **Conversational AI Chat**: Chat with a highly intelligent assistant powered by Google Gemini 2.5 Flash.
- **Text Translation**: Instantly translate text into any target language.
- **Image OCR**: Upload an image to extract text using Tesseract OCR.
- **Image Translation**: Upload an image containing text, and the AI will analyze and translate it directly.
- **Text-to-Speech (TTS)**: The AI's responses are automatically converted to audio using `gTTS`.
- **Chat History**: Your chat sessions are automatically saved and organized in a collapsible sidebar using local storage.
- **Premium UI**: A sleek, blue-green gradient themed interface with smooth micro-animations, modeled after modern chat interfaces like Claude.

## Tech Stack

### Frontend
- **React.js** (via Vite)
- **CSS3** (Custom properties, animations, flexbox layout, frosted glass effects)
- **Lucide React** (Icons)
- **Axios** (API requests)

### Backend
- **FastAPI** (Python web framework)
- **Google Generative AI SDK** (Gemini 2.5 Flash)
- **Pytesseract** (Optical Character Recognition)
- **gTTS** (Google Text-to-Speech)
- **Pillow** (Image processing)

## Setup and Installation

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- Tesseract-OCR installed on your system (Default path for Windows: `C:\Program Files\Tesseract-OCR\tesseract.exe`)
- A Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_google_api_key_here
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Note: If you run it using python main.py make sure you add uvicorn.run to the main.py*

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start both the backend and frontend servers.
2. Open the URL provided by the Vite server (usually `http://localhost:5173`) in your browser.
3. Use the toggle at the top of the chat bar to switch between Chat, Translate, Image OCR, and Image Translate modes.
4. Your chat history is saved automatically and can be accessed from the sidebar.

## License
MIT License
