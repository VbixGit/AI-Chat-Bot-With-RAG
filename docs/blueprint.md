# **App Name**: Chat With AI

## Core Features:

- Chat UI: Display a chat UI with scrollable message history, an input box, and a loading indicator.
- Question Embedding: Generate an embedding for the user's question using the OpenAI Embeddings API. Utilizes a tool to make reasoning about the quality and fitness of the content, if the content includes external urls.
- Weaviate Query: Query Weaviate via its GraphQL API using the embedding vector to retrieve relevant context.
- Answer Generation: Pass the retrieved text context and the user's question to OpenAI GPT-4o to generate an answer based on the context, utilizing a tool to reason about the urls used to inform its response. Includes citations for each source.
- Citation Display: Display the answer with clickable citations linking back to the original sources.
- Clear Chat: Allow users to clear the chat history.
- Health Check Endpoint: Implement a health check endpoint to monitor the status of OpenAI and Weaviate connections.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and intelligence.
- Background color: Very light blue-gray (#F0F4F8), for a clean, unobtrusive background.
- Accent color: Purple (#7E57C2), a brighter hue that is analogous to the primary, for interactive elements like buttons and links.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text, ensuring readability and a modern aesthetic.
- Use minimalist icons for actions like 'send' and 'clear chat'.
- Employ a clean and responsive layout that adapts to different screen sizes.
- Use subtle animations for loading indicators and transitions to provide a smooth user experience.