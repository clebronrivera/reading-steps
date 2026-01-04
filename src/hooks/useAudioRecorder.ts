import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AudioRecordingResult {
  storagePath: string;
  durationSeconds: number;
  fileSizeBytes: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;
      
      // Use webm with opus for best browser support
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to access microphone');
      throw err;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        setIsRecording(false);
        setIsPaused(false);
        
        console.log('Recording stopped, blob size:', blob.size);
        resolve(blob);
      };

      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  }, []);

  const uploadRecording = useCallback(async (
    blob: Blob,
    sessionId: string,
    subtestId: string
  ): Promise<AudioRecordingResult> => {
    const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
    const timestamp = Date.now();
    const fileName = `${sessionId}/${subtestId}/${timestamp}.webm`;
    
    console.log('Uploading recording:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('orf-recordings')
      .upload(fileName, blob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload: ${uploadError.message}`);
    }

    return {
      storagePath: fileName,
      durationSeconds: Math.round(durationSeconds * 100) / 100,
      fileSizeBytes: blob.size,
    };
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  return {
    isRecording,
    isPaused,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    uploadRecording,
    cancelRecording,
  };
}
