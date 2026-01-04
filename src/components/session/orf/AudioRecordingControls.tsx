import { Mic, MicOff, Circle, Square, Pause, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AudioRecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  isTimerRunning: boolean;
  error: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function AudioRecordingControls({
  isRecording,
  isPaused,
  isTimerRunning,
  error,
  onStart,
  onPause,
  onResume,
  onStop,
}: AudioRecordingControlsProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 flex-1">
        {isRecording ? (
          <Badge 
            variant="secondary" 
            className={cn(
              "gap-1",
              isPaused 
                ? "bg-warning/20 text-warning" 
                : "bg-destructive/20 text-destructive animate-pulse"
            )}
          >
            <Circle className="h-2 w-2 fill-current" />
            {isPaused ? 'Paused' : 'Recording'}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <MicOff className="h-3 w-3" />
            Not Recording
          </Badge>
        )}
        
        {error && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!isRecording ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onStart}
            disabled={!isTimerRunning}
            className="gap-1"
          >
            <Mic className="h-4 w-4" />
            Record
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onResume}
                className="gap-1"
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                className="gap-1"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={onStop}
              className="gap-1"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
