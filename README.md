# Enterprise AI Knowledge Hub

A modern, enterprise-grade knowledge management system powered by Retrieval-Augmented Generation (RAG).

## Features

- 📄 **Multi-format Document Support**: Upload PDF, DOCX, TXT, Markdown, and HTML files
- 🔍 **Semantic Search**: Find relevant information using vector embeddings
- 💬 **Conversational Interface**: Chat with your documents using natural language
- 📚 **Source Citations**: Get answers with references to original documents
- 🎨 **Modern UI**: Glassmorphism design with dark/light mode and smooth animations
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔒 **Enterprise-ready**: Built with FastAPI, LangChain, and ChromaDB

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Dropzone

### Backend
- FastAPI
- LangChain
- ChromaDB (vector database)
- OpenAI API (or Gemini)
- Python 3.9+

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenAI API key (or Google API key for Gemini)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

6. Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   CHROMA_DB_PATH=./chroma_db
   HOST=0.0.0.0
   PORT=8000
   ```

7. Start the backend server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Upload Documents**: Click on "Documents" in the sidebar and upload your files
2. **Ask Questions**: Go back to "Chat" and start asking questions about your documents
3. **View Sources**: Each answer includes citations to the original documents
4. **Manage Chats**: Create multiple chat sessions and delete them as needed

## Project Structure

```
trae edi globe/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── uploads/               # Uploaded documents storage
│   └── chroma_db/             # ChromaDB vector storage
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── hooks/            # Custom hooks
    │   ├── utils/            # Utility functions and types
    │   ├── App.tsx           # Main app component
    │   ├── main.tsx          # App entry point
    │   └── index.css         # Global styles
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - List all documents
- `DELETE /api/documents/{doc_id}` - Delete a document

### Chat
- `POST /api/chat` - Send a message to the AI
- `GET /api/chat/sessions` - List all chat sessions
- `GET /api/chat/sessions/{session_id}` - Get a specific chat session
- `DELETE /api/chat/sessions/{session_id}` - Delete a chat session

## License

MIT
