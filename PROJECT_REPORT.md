# Enterprise AI Knowledge Hub - Project Report

## Project Overview

The Enterprise AI Knowledge Hub is a modern, intelligent knowledge management system that uses Retrieval-Augmented Generation (RAG) to help organizations efficiently search and query their internal documents.

## Problem Statement

Organizations generate and store massive amounts of information in various digital formats. As this information grows, finding accurate and relevant content becomes increasingly difficult. Traditional keyword-based search systems often fail to understand the context of user queries, resulting in irrelevant search results, wasted time, and reduced productivity.

## Objectives

- ✅ Build a document ingestion pipeline for multiple document formats
- ✅ Extract and preprocess textual information from uploaded documents
- ✅ Divide documents into meaningful chunks for efficient retrieval
- ✅ Generate embeddings for document chunks using an embedding model
- ✅ Store embeddings in ChromaDB for semantic search
- ✅ Retrieve relevant document chunks based on user queries
- ✅ Generate accurate responses using an LLM and retrieved context
- ✅ Display source citations along with generated responses
- ✅ Provide an interactive web interface for document upload and querying
- ✅ Demonstrate the practical implementation of Retrieval-Augmented Generation

## Technology Stack

### Backend
- **Programming Language**: Python 3.9+
- **Web Framework**: FastAPI
- **LLM Framework**: LangChain
- **Vector Database**: ChromaDB
- **Embedding Model**: OpenAI Embeddings
- **LLM**: OpenAI GPT-3.5-turbo (configurable)

### Frontend
- **Framework**: React 18
- **Programming Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **3D Visualization**: @react-three/fiber, @react-three/drei

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │   Sidebar    │  │     Chat     │  │  Document Upload │     │
│  └──────────────┘  └──────────────┘  └──────────────────┘     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
┌─────────────────────────────▼───────────────────────────────────┐
│                   Backend (FastAPI + LangChain)                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Document Processing: Load → Split → Embed → Store       │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  Query Processing: Embed → Retrieve → Generate → Respond │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      Vector Database (ChromaDB)                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Document Collections + Embeddings + Metadata            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      LLM (OpenAI GPT / Gemini)                    │
└─────────────────────────────────────────────────────────────────┘
```

## RAG Pipeline Flowchart

```
Document Ingestion:
┌─────────────────────┐
│  User Uploads Doc   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Document Loading & Extraction  │
│  (PDF/DOCX/TXT/MD/HTML Loaders)│
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Text Splitting (Chunking)      │
│  (RecursiveCharacterSplitter)   │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Embedding Generation           │
│  (OpenAIEmbeddings)             │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Storage in ChromaDB            │
└─────────────────────────────────┘


Query Processing:
┌─────────────────────┐
│  User Asks Question │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Generate Query Embedding       │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Semantic Search in ChromaDB    │
│  (Retrieve Top K Chunks)        │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Build Context + Prompt         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Generate Answer with LLM       │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Return Answer + Source Citations│
└─────────────────────────────────┘
```

## Functional Requirements

### Document Management
- ✅ Upload enterprise documents
- ✅ Support multiple file formats (PDF, DOCX, TXT, Markdown, HTML)
- ✅ Automatic document preprocessing and chunking
- ✅ View uploaded documents
- ✅ Delete uploaded documents

### AI Querying
- ✅ Semantic similarity search for document retrieval
- ✅ Question-answering using a Large Language Model
- ✅ Display retrieved source documents with each response
- ✅ Conversation history during a session
- ✅ Multiple chat sessions

## Non-Functional Requirements

- ✅ Simple and user-friendly interface with glassmorphism design
- ✅ Fast document retrieval
- ✅ Modular and reusable code
- ✅ Scalable architecture for large document collections
- ✅ Reliable response generation with minimal hallucinations
- ✅ Well-documented source code
- ✅ Dark/light mode support
- ✅ Responsive design
- ✅ Smooth animations and transitions
- ✅ 3D visual effects

## Project Structure

```
trae edi globe/
├── backend/
│   ├── main.py              # FastAPI application with RAG logic
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (create from .env.example)
│   ├── .env.example         # Environment variables template
│   ├── uploads/             # Uploaded documents storage
│   └── chroma_db/           # ChromaDB vector storage
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   ├── ChatInterface.tsx    # Chat UI
│   │   │   ├── DocumentUploader.tsx # Document management UI
│   │   │   └── ThreeScene.tsx       # 3D background
│   │   ├── hooks/
│   │   │   ├── useChat.ts      # Chat state management
│   │   │   └── useDocuments.ts # Document state management
│   │   ├── utils/
│   │   │   ├── api.ts       # API client functions
│   │   │   └── types.ts     # TypeScript type definitions
│   │   ├── App.tsx       # Main app component
│   │   ├── main.tsx      # App entry point
│   │   └── index.css     # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── tsconfig.node.json
├── sample-document.md      # Sample enterprise document
├── PROJECT_SPECIFICATION.md # Project requirements and specification
├── ARCHITECTURE.md         # System architecture documentation
├── PROJECT_REPORT.md       # This report
├── README.md               # Quick start guide
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
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

5. Create a `.env` file with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   CHROMA_DB_PATH=./chroma_db
   HOST=0.0.0.0
   PORT=8000
   ```

6. Start the backend server:
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

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Upload Documents**: Click on "Documents" in the sidebar and upload your documents
2. **Ask Questions**: Go back to "Chat" and start asking questions about your documents
3. **View Sources**: Each answer includes citations to the original documents
4. **Manage Chats**: Create multiple chat sessions and delete them as needed
5. **Toggle Theme**: Switch between dark and light modes

## Learning Outcomes

Upon completion of this project, we have learned to:

- ✅ Understand the architecture of Retrieval-Augmented Generation (RAG)
- ✅ Build an end-to-end RAG application using LangChain
- ✅ Process and manage large collections of enterprise documents
- ✅ Perform semantic search using vector embeddings and ChromaDB
- ✅ Integrate Large Language Models into intelligent applications
- ✅ Design user-friendly AI-powered interfaces using React and modern web technologies
- ✅ Apply Generative AI techniques to solve real-world enterprise problems

## Deliverables

- ✅ Complete source code
- ✅ Well-documented project report (this file)
- ✅ System architecture diagram
- ✅ Flowchart of the RAG pipeline
- ✅ Sample enterprise dataset (sample-document.md)
- ✅ Working application
- ✅ Comprehensive documentation in all files

## Future Enhancements

- User authentication and authorization
- More document format support (PPTX, XLSX, etc.)
- Advanced document metadata extraction
- Improved UI/UX with more features
- Batch document processing
- Export chat history
- Mobile app version
- On-premises deployment options
- Integration with existing enterprise systems

## Conclusion

The Enterprise AI Knowledge Hub successfully demonstrates how Retrieval-Augmented Generation can be used to build an intelligent knowledge management system that reduces search time, improves information accessibility, and enhances decision-making in real-world organizations.
