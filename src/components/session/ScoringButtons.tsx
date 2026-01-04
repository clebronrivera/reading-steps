import { Check, X, RotateCcw, HelpCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type ResponseCode = Database['public']['Enums']['response_code'];

interface ScoringButtonsProps {
  onScore: (code: ResponseCode, extras?: { errorType?: string; strategyTag?: string }) => void;
  showErrorTypes?: boolean;
  showStrategyTags?: boolean;
  disabled?: boolean;
}

const ERROR_TYPES = [
  'substitution',
  'omission',
  'insertion',
  'hesitation',
  'reversal',
];

const STRATEGY_TAGS = [
  'automatic',
  'sounded_out',
  'blended',
  'guessed',
];

export function ScoringButtons({ 
  onScore, 
  showErrorTypes = false,
  showStrategyTags = false,
  disabled = false 
}: ScoringButtonsProps) {
  return (
    <div className="space-y-4">
      {/* Primary scoring buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onScore('correct')}
          className="response-correct h-14 text-lg font-semibold"
          disabled={disabled}
        >
          <Check className="h-5 w-5 mr-2" />
          Correct
        </Button>
        <Button
          onClick={() => onScore('incorrect')}
          className="response-incorrect h-14 text-lg font-semibold"
          disabled={disabled}
        >
          <X className="h-5 w-5 mr-2" />
          Incorrect
        </Button>
      </div>

      {/* Secondary scoring options */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => onScore('self_correct')}
          className="response-self-correct h-11"
          disabled={disabled}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Self-Correct
        </Button>
        <Button
          onClick={() => onScore('prompted')}
          className="response-prompted h-11"
          disabled={disabled}
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Prompted
        </Button>
        <Button
          onClick={() => onScore('no_response')}
          className="response-no-response h-11"
          disabled={disabled}
        >
          <Clock className="h-4 w-4 mr-1" />
          No Response
        </Button>
      </div>

      {/* Error type quick tags */}
      {showErrorTypes && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Error Type</p>
          <div className="flex flex-wrap gap-1">
            {ERROR_TYPES.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => onScore('incorrect', { errorType: type })}
                disabled={disabled}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Strategy tags */}
      {showStrategyTags && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Strategy</p>
          <div className="flex flex-wrap gap-1">
            {STRATEGY_TAGS.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => onScore('correct', { strategyTag: tag })}
                disabled={disabled}
              >
                {tag.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
