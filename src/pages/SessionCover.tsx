import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, Play, User } from 'lucide-react';
import { AssessorCockpit } from '@/components/session/AssessorCockpit';

interface SessionData {
  session: {
    id: string;
    status: string;
    started_at: string;
    students: {
      id: string;
      full_name: string;
      grade: string;
      date_of_birth: string;
      primary_concerns: string[] | null;
    };
    appointments: {
      scheduled_at: string;
      zoom_join_url: string | null;
    } | null;
  };
  subtests: any[];
  responses: any[];
  accessLevel: string;
}

export default function SessionCover() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'error'>('validating');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    validateAndFetchSession();
  }, [token]);

  const validateAndFetchSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('session-access', {
        body: { action: 'get_session_data', token }
      });

      if (error || data?.error) {
        console.error('Session access error:', error || data?.error);
        setStatus('invalid');
        return;
      }

      setSessionData(data);
      setStatus('valid');
    } catch (err) {
      console.error('Failed to validate session:', err);
      setStatus('error');
    }
  };

  if (status === 'validating') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Validating access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Invalid or Expired Link</h2>
              <p className="text-muted-foreground">
                This session link is no longer valid. Please request a new link from the primary assessor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Connection Error</h2>
              <p className="text-muted-foreground">
                Unable to connect to the server. Please check your internet connection and try again.
              </p>
              <Button onClick={validateAndFetchSession}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionData) return null;

  const { session, subtests, responses } = sessionData;
  const student = session.students;

  // Show session ready screen before starting
  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <Badge variant="secondary">Substitute Access</Badge>
            </div>
            <CardTitle className="text-2xl">Session Ready</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{student.full_name}</p>
                  <p className="text-sm text-muted-foreground">Grade {student.grade}</p>
                </div>
              </div>
              
              {student.primary_concerns && student.primary_concerns.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Primary Concerns:</p>
                  <div className="flex flex-wrap gap-1">
                    {student.primary_concerns.map((concern, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session.appointments?.zoom_join_url && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium mb-2">Zoom Meeting</p>
                <a 
                  href={session.appointments.zoom_join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 underline"
                >
                  Join Zoom Meeting
                </a>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• You have full access to conduct this assessment</p>
              <p>• All responses will be saved automatically</p>
              <p>• This link expires after 24 hours</p>
            </div>

            <Button 
              onClick={() => setSessionStarted(true)} 
              className="w-full"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the Assessor Cockpit once started
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
          <strong>Substitute Access</strong> — Conducting session for {student.full_name}
        </p>
      </div>
      <AssessorCockpit sessionId={session.id} />
    </div>
  );
}
