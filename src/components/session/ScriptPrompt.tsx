import { BookOpen } from 'lucide-react';

interface ScriptPromptProps {
  prompt: string | null;
  subtestName: string;
}

export function ScriptPrompt({ prompt, subtestName }: ScriptPromptProps) {
  if (!prompt) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm font-medium">Script for {subtestName}</span>
      </div>
      <p className="text-foreground leading-relaxed">
        "{prompt}"
      </p>
    </div>
  );
}
