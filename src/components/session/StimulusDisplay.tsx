import { useState, useEffect, useRef } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Subtest = Database['public']['Tables']['subtests']['Row'];

interface StimulusDisplayProps {
  subtest: Subtest | null;
  currentItemIndex: number;
  pointerPosition: { x: number; y: number } | null;
  isStudentView?: boolean;
}

interface StimulusItem {
  text?: string;
  items?: string[];
  options?: string[];
  passage?: string;
}

interface StimulusData {
  items?: (StimulusItem | string)[];
  type?: string;
  passage_text?: string;
  questions?: Array<{
    id: number;
    question_stem: string;
    options: string[];
    correct_answer: string;
  }>;
}

export function StimulusDisplay({ 
  subtest, 
  currentItemIndex, 
  pointerPosition,
  isStudentView = false 
}: StimulusDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stimulusData, setStimulusData] = useState<StimulusData | null>(null);

  useEffect(() => {
    if (subtest?.stimulus_data) {
      try {
        setStimulusData(subtest.stimulus_data as StimulusData);
      } catch {
        setStimulusData(null);
      }
    } else {
      setStimulusData(null);
    }
  }, [subtest]);

  // Get current item - handle both array of objects and array of strings
  const getCurrentItem = (): StimulusItem | null => {
    if (!stimulusData?.items || stimulusData.items.length === 0) return null;
    
    const item = stimulusData.items[currentItemIndex];
    if (!item) return null;
    
    // If item is a string (e.g., letter naming), convert to StimulusItem
    if (typeof item === 'string') {
      return { text: item };
    }
    return item as StimulusItem;
  };

  const currentItem = getCurrentItem();

  if (!subtest) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-2xl text-muted-foreground">Waiting for assessment...</p>
      </div>
    );
  }
  
  if (!stimulusData) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-2xl text-muted-foreground">No stimulus data available</p>
      </div>
    );
  }

  const renderStimulus = () => {
    const moduleType = subtest.module_type;
    const dataType = stimulusData.type;

    // Handle comprehension passages with questions
    if (dataType === 'comprehension' || moduleType === 'comprehension') {
      const passageText = stimulusData.passage_text;
      const questions = stimulusData.questions || [];
      const question = questions[currentItemIndex];
      
      return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {passageText && (
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-xl leading-relaxed text-foreground whitespace-pre-line">
                {passageText}
              </p>
            </div>
          )}
          {question && (
            <div className="space-y-6">
              <p className="text-2xl font-semibold text-foreground">
                {question.id}. {question.question_stem}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-card rounded-lg border border-border text-lg hover:bg-muted/50 transition-colors"
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle letter naming / sounds (items are strings)
    if (dataType === 'letter_naming' || dataType === 'letter_sounds') {
      return (
        <div className="flex items-center justify-center">
          <span className="text-[120px] font-bold text-foreground tracking-wide font-sans">
            {currentItem?.text || '?'}
          </span>
        </div>
      );
    }

    // Fallback to module-type based rendering
    switch (moduleType) {
      case 'orf':
        // Oral Reading Fluency - show passage
        return (
          <div className="max-w-3xl mx-auto p-8">
            <p className="text-3xl leading-relaxed font-serif text-foreground">
              {currentItem?.passage || currentItem?.text || 'No passage loaded'}
            </p>
          </div>
        );

      case 'phonics':
      case 'hfw':
        // Single word or letter display
        return (
          <div className="flex items-center justify-center">
            <span className="text-8xl font-bold text-foreground tracking-wide">
              {currentItem?.text || '?'}
            </span>
          </div>
        );

      case 'phonological_awareness':
        // May show word with options
        if (currentItem?.options && currentItem.options.length > 0) {
          return (
            <div className="flex flex-col items-center gap-12">
              {currentItem.text && (
                <span className="text-6xl font-bold text-foreground">
                  {currentItem.text}
                </span>
              )}
              <div className="flex gap-8">
                {currentItem.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="w-32 h-32 flex items-center justify-center bg-card rounded-xl border-2 border-border text-4xl font-semibold"
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <span className="text-7xl font-bold text-foreground">
            {currentItem?.text || '?'}
          </span>
        );

      case 'print_awareness':
        // Could show images or book elements
        return (
          <div className="flex items-center justify-center">
            <div className="bg-card p-12 rounded-xl border-2 border-border">
              <span className="text-5xl text-foreground">
                {currentItem?.text || '?'}
              </span>
            </div>
          </div>
        );

      default:
        // Generic display
        return (
          <div className="flex items-center justify-center">
            <span className="text-6xl font-bold text-foreground">
              {currentItem?.text || 'Ready'}
            </span>
          </div>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center ${
        isStudentView ? 'bg-background' : 'bg-muted/30'
      }`}
    >
      {renderStimulus()}
      
      {/* Laser pointer indicator */}
      {pointerPosition && (
        <div
          className="absolute w-6 h-6 rounded-full bg-destructive/80 pointer-events-none animate-pulse shadow-lg"
          style={{
            left: `${pointerPosition.x}%`,
            top: `${pointerPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
}
