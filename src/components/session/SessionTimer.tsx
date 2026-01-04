import { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionTimerProps {
  seconds: number;
  isRunning: boolean;
  maxSeconds?: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTick: (seconds: number) => void;
}

export function SessionTimer({
  seconds,
  isRunning,
  maxSeconds,
  onStart,
  onPause,
  onReset,
  onTick,
}: SessionTimerProps) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        onTick(seconds + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds, onTick]);

  // Auto-stop at max seconds
  useEffect(() => {
    if (maxSeconds && seconds >= maxSeconds && isRunning) {
      onPause();
    }
  }, [seconds, maxSeconds, isRunning, onPause]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = maxSeconds ? (seconds / maxSeconds) * 100 : 0;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Timer</span>
        {maxSeconds && (
          <span className="text-xs text-muted-foreground">
            Max: {formatTime(maxSeconds)}
          </span>
        )}
      </div>

      <div className="text-center">
        <span className="text-4xl font-mono font-bold text-foreground">
          {formatTime(seconds)}
        </span>
      </div>

      {maxSeconds && (
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      <div className="flex gap-2">
        {!isRunning ? (
          <Button
            onClick={onStart}
            className="flex-1 response-correct"
            size="sm"
          >
            <Play className="h-4 w-4 mr-1" />
            Start
          </Button>
        ) : (
          <Button
            onClick={onPause}
            variant="secondary"
            className="flex-1"
            size="sm"
          >
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </Button>
        )}
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
