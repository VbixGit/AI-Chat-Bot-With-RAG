import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

type EmptyStateProps = {
  setQuery: (query: string) => void;
}

export function ChatEmptyState({ setQuery }: EmptyStateProps) {
    const exampleQueries = [
        "What are the benefits of using Firebase for web development?",
        "How does Weaviate's vector search work?",
        "Explain Retrieval-Augmented Generation (RAG).",
    ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="mb-4 text-accent">
        <Sparkles className="w-16 h-16" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 font-headline">Welcome to VectorSage</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Ask me anything! I can answer questions by leveraging information from a knowledge base using OpenAI and Weaviate.
      </p>
      <div className="w-full max-w-md">
        <p className="text-sm font-medium text-muted-foreground mb-2">Try an example:</p>
        <div className="grid grid-cols-1 gap-2">
            {exampleQueries.map((query) => (
                <Card 
                    key={query}
                    className="p-3 text-left cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setQuery(query)}
                >
                    <CardContent className="p-0">
                        <p className="text-sm">{query}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
