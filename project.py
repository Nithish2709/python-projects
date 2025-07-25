import os
import uuid
import re
import google.generativeai as genai
from PIL import Image
from gtts import gTTS
from playsound import playsound
import speech_recognition as sr
from tkinter import Tk
from tkinter.filedialog import askopenfilename
import pytesseract


GEMINI_API_KEY = ''#replace your api
genai.configure(api_key=GEMINI_API_KEY)

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
chat_session = model.start_chat()

# ==== MARKDOWN CLEANER ====
def clean_markdown(text):
    # Remove markdown but preserve spacing and newlines
    return re.sub(r'[*_`#>~\-]', '', text)

# ==== FUNCTIONS ====
def speech_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎤 Listening...")
        audio = recognizer.listen(source)
    try:
        return recognizer.recognize_google(audio)
    except:
        return "Sorry, I couldn't understand."

def text_to_speech(text, lang='en'):
    filename = f"temp_{uuid.uuid4().hex}.mp3"
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)
    playsound(filename)
    os.remove(filename)

def gemini_translate(text, target_language):
    prompt = f"Translate this into {target_language}:\n{text}"
    response = model.generate_content(prompt)
    cleaned = clean_markdown(response.text)
    return cleaned

def chatbot_response(prompt):
    response = chat_session.send_message(prompt)
    cleaned = clean_markdown(response.text)
    return cleaned

def choose_image_file():
    Tk().withdraw()
    filepath = askopenfilename(title="Select an image file",
                               filetypes=[("Image files", "*.png *.jpg *.jpeg *.bmp")])
    return filepath

def translate_image_text_with_gemini(image_path, target_lang):
    try:
        with open(image_path, "rb") as img_file:
            img_bytes = img_file.read()
        response = model.generate_content([
            {"text": f"Translate the text in this image to {target_lang}"},
            {"mime_type": "image/jpeg", "data": img_bytes}
        ])
        cleaned = clean_markdown(response.text)
        return cleaned
    except Exception as e:
        return f"❌ Error: {e}"

def extract_text_with_tesseract(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        return f"❌ OCR Error: {e}"

# ==== MAIN ====
def main():
    print("\n🤖 Welcome to Real-Time AI Translator + Chatbot")

    while True:
        print("\nChoose mode:\n1. Speak\n2. Type\n3. Upload Image (Translate)\n4. Chat with AI\n5. Exit\n6. Upload Image (OCR)")
        choice = input("🧠 Enter choice (1–6): ")

        if choice == '1':
            input_text = speech_to_text()
            print("🗣 You said:\n" + input_text)

            mode = input("💬 Chat or Translate? (c/t): ").lower()
            if mode == 't':
                lang = input("🌐 Translate to which language? ")
                translated = gemini_translate(input_text, lang)
                print("🈯 Translated:\n" + translated)
                output = input("🔊 Output as (text/audio): ").lower()
                if output == 'audio':
                    text_to_speech(translated)
            elif mode == 'c':
                response = chatbot_response(input_text)
                print("🤖 Chatbot:\n" + response)
                output = input("🔊 Output as (text/audio): ").lower()
                if output == 'audio':
                    text_to_speech(response)

        elif choice == '2':
            input_text = input("💬 Enter your message: ")
            mode = input("💬 Chat or Translate? (c/t): ").lower()
            if mode == 't':
                lang = input("🌐 Translate to which language? ")
                translated = gemini_translate(input_text, lang)
                print("🈯 Translated:\n" + translated)
                output = input("🔊 Output as (text/audio): ").lower()
                if output == 'audio':
                    text_to_speech(translated)
            elif mode == 'c':
                response = chatbot_response(input_text)
                print("🤖 Chatbot:\n" + response)
                output = input("🔊 Output as (text/audio): ").lower()
                if output == 'audio':
                    text_to_speech(response)

        elif choice == '3':
            print("🖼 Select an image file...")
            image_path = choose_image_file()
            if not image_path:
                print("❌ No image selected.")
                continue
            target_lang = input("🌐 Translate image text to which language? ")
            translated_text = translate_image_text_with_gemini(image_path, target_lang)
            print("🈶 Translated text:\n" + translated_text)
            output = input("🔊 Output as (text/audio): ").lower()
            if output == 'audio':
                text_to_speech(translated_text)

        elif choice == '4':
            print("💬 Start chatting with Gemini AI. Type 'exit' to return to menu.")
            while True:
                user_input = input("💬 You: ")
                if user_input.lower() in ['exit', 'quit']:
                    break
                response = chatbot_response(user_input)
                print("🤖 Chatbot:\n" + response)
                output = input("🔊 Output as (text/audio): ").lower()
                if output == 'audio':
                    text_to_speech(response)

        elif choice == '5':
            print("👋 Goodbye!")
            break

        elif choice == '6':
            print("🖼 Select an image file to extract text with Tesseract...")
            image_path = choose_image_file()
            if not image_path:
                print("❌ No image selected.")
                continue
            extracted_text = extract_text_with_tesseract(image_path)
            print("📄 Extracted Text:\n" + extracted_text)
            output = input("🔊 Output as (text/audio): ").lower()
            if output == 'audio':
                text_to_speech(extracted_text)

        else:
            print("❌ Invalid option.")

if __name__ == "__main__":
    main()
