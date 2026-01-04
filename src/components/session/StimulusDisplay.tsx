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

export function StimulusDisplay({ 
  subtest, 
  currentItemIndex, 
  pointerPosition,
  isStudentView = false 
}: StimulusDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stimulusData, setStimulusData] = useState<StimulusItem[]>([]);

  useEffect(() => {
    if (subtest?.stimulus_data) {
      try {
        const data = subtest.stimulus_data as { items?: StimulusItem[] };
        setStimulusData(data.items || []);
      } catch {
        setStimulusData([]);
      }
    }
  }, [subtest]);

  const currentItem = stimulusData[currentItemIndex];

  if (!subtest || !currentItem) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-2xl text-muted-foreground">No stimulus loaded</p>
      </div>
    );
  }

  const renderStimulus = () => {
    const moduleType = subtest.module_type;

    switch (moduleType) {
      case 'orf':
        // Oral Reading Fluency - show passage
        return (
          <div className="max-w-3xl mx-auto p-8">
            <p className="text-3xl leading-relaxed font-serif text-foreground">
              {currentItem.passage || currentItem.text}
            </p>
          </div>
        );

      case 'phonics':
      case 'hfw':
        // Single word or letter display
        return (
          <div className="flex items-center justify-center">
            <span className="text-8xl font-bold text-foreground tracking-wide">
              {currentItem.text}
            </span>
          </div>
        );

      case 'phonological_awareness':
        // May show word with options
        if (currentItem.options && currentItem.options.length > 0) {
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
            {currentItem.text}
          </span>
        );

      case 'print_awareness':
        // Could show images or book elements
        return (
          <div className="flex items-center justify-center">
            <div className="bg-card p-12 rounded-xl border-2 border-border">
              <span className="text-5xl text-foreground">
                {currentItem.text}
              </span>
            </div>
          </div>
        );

      case 'comprehension':
        // Show passage with question
        return (
          <div className="max-w-3xl mx-auto p-8 space-y-8">
            {currentItem.passage && (
              <p className="text-2xl leading-relaxed text-foreground">
                {currentItem.passage}
              </p>
            )}
            {currentItem.text && (
              <p className="text-3xl font-semibold text-foreground mt-8">
                {currentItem.text}
              </p>
            )}
            {currentItem.options && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {currentItem.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-card rounded-lg border border-border text-xl"
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <span className="text-6xl font-bold text-foreground">
            {currentItem.text || 'Stimulus'}
          </span>
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
