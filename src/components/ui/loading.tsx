export function Loading() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full animate-pulse"></div>
    </div>
  );
}
