# Employee RAG System

A Retrieval-Augmented Generation (RAG) system for managing and querying employee information using Pinecone for vector storage and Ollama for embeddings and LLM responses.

## Prerequisites

- Node.js (v16 or higher)
- Ollama installed locally
- Pinecone account and API key
- OpenAI API key (for Ollama configuration)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-rag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PINECONE_API_KEY=your_pinecone_api_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_API_URL=http://localhost:11434/v1
   ```

4. **Install and run Ollama**
   - Install Ollama from [ollama.ai](https://ollama.ai)
   - Pull the required models:
     ```bash
     ollama pull mxbai-embed-large:latest
     ollama pull gemma3:4b-it-qat
     ```

5. **Create Pinecone Index**
   - Log in to your Pinecone console
   - Create a new index named 'employee-demo-rag2'
   - Set the dimension to 1536
   - Use cosine similarity as the metric

## Running the Application

1. **Start the application**
   ```bash
   npm start
   ```

2. **Using the Application**
   The application provides three main options:
   - Add new employees
   - Search/Ask questions about employees
   - Quit

   In the search mode, you can:
   - Ask questions about employees
   - Have a continuous conversation with the AI
   - Type 'menu' to return to the main menu
   - Type 'quit' to exit the application

## Project Structure

```
employee-rag/
├── app.js                 # Main application file
├── services/
│   ├── embeddings.js      # Embedding and vector operations
│   └── pinecone.js        # Pinecone configuration
├── data/
│   └── data.js           # Sample employee data
└── .env                  # Environment variables
```

## Features

- Vector-based employee information storage
- Semantic search capabilities
- Conversational AI interface
- Context-aware responses
- Continuous conversation mode
- Easy employee data management

## Troubleshooting

1. **Ollama Connection Issues**
   - Ensure Ollama is running locally
   - Check if the models are properly downloaded
   - Verify the API URL in .env file

2. **Pinecone Issues**
   - Verify your API key
   - Check if the index exists and is properly configured
   - Ensure the namespace is created

3. **Embedding Generation Issues**
   - Check Ollama logs for any model loading errors
   - Verify the input text format

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
