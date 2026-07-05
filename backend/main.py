import os
import uuid
import re
import google.generativeai as genai
from PIL import Image
from gtts import gTTS
import pytesseract
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Translator API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# Update Tesseract path based on Windows default, or assume it's in PATH
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Initialize model
model = genai.GenerativeModel("models/gemini-2.5-flash")
try:
    chat_session = model.start_chat()
except Exception as e:
    print(f"Error starting chat session: {e}")
    chat_session = None

# Ensure temp directory exists for audio files
os.makedirs("temp_audio", exist_ok=True)

# ==== MARKDOWN CLEANER ====
def clean_markdown(text):
    # Remove markdown but preserve spacing and newlines
    return re.sub(r'[*_`#>~\-]', '', text)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Translator & Chatbot API"}

@app.post("/api/chat")
async def chat(prompt: str = Form(...)):
    if not chat_session:
        return JSONResponse(status_code=500, content={"error": "Gemini API key is missing or invalid."})
    try:
        response = chat_session.send_message(prompt)
        cleaned = clean_markdown(response.text)
        return {"response": cleaned}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/translate")
async def translate(text: str = Form(...), target_lang: str = Form(...)):
    try:
        prompt = f"Translate this into {target_lang}:\n{text}"
        response = model.generate_content(prompt)
        cleaned = clean_markdown(response.text)
        return {"translated_text": cleaned}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/tts")
async def text_to_speech(text: str = Form(...), lang: str = Form("en")):
    try:
        filename = f"temp_audio/temp_{uuid.uuid4().hex}.mp3"
        tts = gTTS(text=text, lang=lang)
        tts.save(filename)
        # We can return the file and use background tasks to delete it later, 
        # but for simplicity, we return the file. React will play it.
        return FileResponse(filename, media_type="audio/mpeg", filename="audio.mp3")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/ocr")
async def ocr(image: UploadFile = File(...)):
    try:
        img = Image.open(image.file)
        text = pytesseract.image_to_string(img)
        return {"text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/image-translate")
async def image_translate(image: UploadFile = File(...), target_lang: str = Form(...)):
    try:
        img_bytes = await image.read()
        response = model.generate_content([
            {"text": f"Translate the text in this image to {target_lang}"},
            {"mime_type": image.content_type, "data": img_bytes}
        ])
        cleaned = clean_markdown(response.text)
        return {"translated_text": cleaned}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
