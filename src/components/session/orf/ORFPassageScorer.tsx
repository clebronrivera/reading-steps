import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

export type WordStatus = 'correct' | 'error' | 'self_correct' | 'skipped';

export interface WordMark {
  index: number;
  status: WordStatus;
  errorType?: string;
}

interface ORFPassageScorerProps {
  passage: string;
  wordMarks: WordMark[];
  onWordClick: (index: number, currentStatus: WordStatus) => void;
  isTimerRunning: boolean;
  lastWordIndex?: number; // Where student stopped reading
  onSetLastWord?: (index: number) => void;
}

const ERROR_CYCLE: WordStatus[] = ['correct', 'error', 'self_correct'];

export function ORFPassageScorer({
  passage,
  wordMarks,
  onWordClick,
  isTimerRunning,
  lastWordIndex,
  onSetLastWord,
}: ORFPassageScorerProps) {
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);

  const words = useMemo(() => {
    return passage.split(/\s+/).filter(w => w.length > 0);
  }, [passage]);

  const getWordStatus = useCallback((index: number): WordStatus => {
    const mark = wordMarks.find(m => m.index === index);
    return mark?.status || 'correct';
  }, [wordMarks]);

  const handleWordClick = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const currentStatus = getWordStatus(index);
    onWordClick(index, currentStatus);
  }, [getWordStatus, onWordClick]);

  const handleRightClick = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (onSetLastWord) {
      onSetLastWord(index);
    }
  }, [onSetLastWord]);

  const getWordClassName = (index: number, status: WordStatus) => {
    const isLastWord = lastWordIndex === index;
    const isAfterLastWord = lastWordIndex !== undefined && index > lastWordIndex;
    
    return cn(
      'inline-block px-1 py-0.5 mx-0.5 my-1 rounded cursor-pointer transition-all select-none',
      'text-lg leading-relaxed',
      // Status colors
      status === 'correct' && 'bg-transparent hover:bg-success/20',
      status === 'error' && 'bg-destructive/30 text-destructive-foreground line-through',
      status === 'self_correct' && 'bg-warning/30 border-b-2 border-warning',
      status === 'skipped' && 'bg-muted text-muted-foreground',
      // Last word indicator
      isLastWord && 'ring-2 ring-primary ring-offset-2',
      // Words after last word are faded
      isAfterLastWord && 'opacity-40',
      // Hover state
      hoveredWord === index && 'ring-2 ring-primary/50'
    );
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Click word to mark error • Right-click to set stopping point</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-destructive/30" /> Error
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-warning/30 border-b-2 border-warning" /> Self-correct
          </span>
        </div>
      </div>

      {/* Passage with clickable words */}
      <div className="p-4 bg-card rounded-lg border border-border min-h-[200px]">
        <div className="leading-loose">
          {words.map((word, index) => {
            const status = getWordStatus(index);
            return (
              <span
                key={index}
                className={getWordClassName(index, status)}
                onClick={(e) => handleWordClick(index, e)}
                onContextMenu={(e) => handleRightClick(index, e)}
                onMouseEnter={() => setHoveredWord(index)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Word count info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Total words: {words.length}
        </span>
        {lastWordIndex !== undefined && (
          <span className="text-primary font-medium">
            Words attempted: {lastWordIndex + 1}
          </span>
        )}
      </div>
    </div>
  );
}
