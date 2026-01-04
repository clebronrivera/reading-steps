import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Play, 
  Copy, 
  ExternalLink, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { GenerateCoverLink } from "@/components/session/GenerateCoverLink";

interface Student {
  id: string;
  full_name: string;
  grade: string;
  lead_status: string;
  parents: { full_name: string; email: string } | null;
}

interface Session {
  id: string;
  status: string | null;
  started_at: string;
  ended_at: string | null;
  student_id: string;
  students: { full_name: string; grade: string } | null;
}

export default function SessionLaunch() {
  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const baseUrl = window.location.origin;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [studentsRes, sessionsRes] = await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, grade, lead_status, parents (full_name, email)")
        .order("created_at", { ascending: false }),
      supabase
        .from("sessions")
        .select("id, status, started_at, ended_at, student_id, students (full_name, grade)")
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

    if (studentsRes.data) setStudents(studentsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    
    setIsLoading(false);
  };

  const createSession = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Select a student",
        description: "Please select a student to create a session.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        student_id: selectedStudentId,
        assessor_id: user.user?.id,
        status: "scheduled",
      })
      .select("id, status, started_at, ended_at, student_id, students (full_name, grade)")
      .single();

    if (error) {
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setSessions([data, ...sessions]);
      setDialogOpen(false);
      toast({
        title: "Session created",
        description: "You can now share the session URLs.",
      });
    }

    setIsCreating(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} URL copied to clipboard.`,
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Session Runner</h2>
            <p className="text-muted-foreground">
              Create and manage split-screen assessment sessions
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Select a student to create a new assessment session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedStudent && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedStudent.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStudent.grade} • {selectedStudent.parents?.full_name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSession} disabled={!selectedStudentId || isCreating}>
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Start Card (if preselected student) */}
        {selectedStudent && !dialogOpen && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Start for {selectedStudent.full_name}
              </CardTitle>
              <CardDescription>
                Create a new session or view existing sessions for this student.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDialogOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start New Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              View and manage your assessment sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sessions yet. Create your first session to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    baseUrl={baseUrl}
                    onCopy={copyToClipboard}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface SessionCardProps {
  session: Session;
  baseUrl: string;
  onCopy: (text: string, label: string) => void;
  getStatusBadge: (status: string | null) => React.ReactNode;
}

function SessionCard({ session, baseUrl, onCopy, getStatusBadge }: SessionCardProps) {
  const assessorUrl = `${baseUrl}/session/${session.id}/assessor`;
  const studentUrl = `${baseUrl}/session/${session.id}/student`;

  return (
    <Card className="border">
      <CardContent className="pt-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Session Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">
                {session.students?.full_name || "Unknown Student"}
              </h4>
              {getStatusBadge(session.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(session.started_at), "MMM d, h:mm a")}
              </span>
              {session.students?.grade && (
                <span>{session.students.grade}</span>
              )}
            </div>
          </div>

          {/* URL Actions */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            {/* Cover Link */}
            <GenerateCoverLink 
              sessionId={session.id} 
              studentName={session.students?.full_name} 
            />
            
            {/* Assessor URL */}
            <div className="flex items-center gap-1">
              <Input
                value={assessorUrl}
                readOnly
                className="w-full sm:w-48 text-xs h-8"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => onCopy(assessorUrl, "Assessor")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                asChild
              >
                <a href={assessorUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>

            {/* Student URL */}
            <div className="flex items-center gap-1">
              <Input
                value={studentUrl}
                readOnly
                className="w-full sm:w-48 text-xs h-8"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => onCopy(studentUrl, "Student")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                asChild
              >
                <a href={studentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
