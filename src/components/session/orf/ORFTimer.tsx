import { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ORFTimerProps {
  seconds: number;
  isRunning: boolean;
  maxSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTick: (seconds: number) => void;
  onComplete?: () => void;
}

export function ORFTimer({
  seconds,
  isRunning,
  maxSeconds,
  onStart,
  onPause,
  onReset,
  onTick,
  onComplete,
}: ORFTimerProps) {
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
      onComplete?.();
    }
  }, [seconds, maxSeconds, isRunning, onPause, onComplete]);

  const remainingSeconds = maxSeconds - seconds;
  const progress = (seconds / maxSeconds) * 100;
  const isNearEnd = remainingSeconds <= 10;
  const isComplete = seconds >= maxSeconds;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.abs(totalSeconds) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "rounded-lg border-2 p-4 space-y-3 transition-colors",
      isComplete ? "border-success bg-success/10" :
      isNearEnd && isRunning ? "border-destructive bg-destructive/10 animate-pulse" :
      isRunning ? "border-primary bg-primary/5" :
      "border-border bg-card"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          ORF Timer (60 seconds)
        </span>
        {isComplete && (
          <span className="text-xs font-bold text-success uppercase">Complete</span>
        )}
      </div>

      {/* Countdown display */}
      <div className="text-center">
        <span className={cn(
          "text-5xl font-mono font-bold tabular-nums",
          isComplete ? "text-success" :
          isNearEnd && isRunning ? "text-destructive" :
          "text-foreground"
        )}>
          {isComplete ? formatTime(seconds) : formatTime(remainingSeconds)}
        </span>
        <div className="text-xs text-muted-foreground mt-1">
          {isComplete ? 'Elapsed' : 'Remaining'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isComplete ? "bg-success" :
            isNearEnd ? "bg-destructive" :
            "bg-primary"
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isComplete ? (
          <>
            {!isRunning ? (
              <Button
                onClick={onStart}
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {seconds === 0 ? 'Start' : 'Resume'}
              </Button>
            ) : (
              <Button
                onClick={onPause}
                variant="secondary"
                className="flex-1"
                size="lg"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={() => {
                onPause();
                onComplete?.();
              }}
              variant="outline"
              size="lg"
              disabled={seconds === 0}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset Timer
          </Button>
        )}
      </div>
    </div>
  );
}
