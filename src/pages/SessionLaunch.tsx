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

interface Student {
  id: string;
  full_name: string;
  grade: string;
  lead_status: string;
  parents: { full_name: string; email: string } | null;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface Subtest {
  id: string;
  name: string;
  category_id: string | null;
  grade: string | null;
  module_type: string | null;
  item_count: number | null;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtests, setSubtests] = useState<Subtest[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || "");
  const [selectedSubtestIds, setSelectedSubtestIds] = useState<string[]>([]);
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
    
    const [studentsRes, sessionsRes, categoriesRes, subtestsRes] = await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, grade, lead_status, parents (full_name, email)")
        .order("created_at", { ascending: false }),
      supabase
        .from("sessions")
        .select("id, status, started_at, ended_at, student_id, students (full_name, grade)")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("assessment_categories")
        .select("id, name, parent_id")
        .order("display_order"),
      supabase
        .from("subtests")
        .select("id, name, category_id, grade, module_type, item_count")
        .not("category_id", "is", null)
        .order("order_index"),
    ]);

    if (studentsRes.data) setStudents(studentsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (subtestsRes.data) setSubtests(subtestsRes.data);
    
    setIsLoading(false);
  };

  // Group subtests by category
  const subtestsByCategory = subtests.reduce((acc, subtest) => {
    const catId = subtest.category_id || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(subtest);
    return acc;
  }, {} as Record<string, Subtest[]>);

  // Get reading categories (children of Reading area)
  const readingAreaId = categories.find(c => c.name === 'Reading' && !c.parent_id)?.id;
  const readingCategories = categories.filter(c => c.parent_id === readingAreaId);

  const toggleSubtest = (subtestId: string) => {
    setSelectedSubtestIds(prev => 
      prev.includes(subtestId) 
        ? prev.filter(id => id !== subtestId)
        : [...prev, subtestId]
    );
  };

  const createSession = async (skipSubtests = false) => {
    if (!selectedStudentId) {
      toast({
        title: "Select a student",
        description: "Please select a student to create a session.",
        variant: "destructive",
      });
      return;
    }

    // Only require subtests if not skipping
    if (!skipSubtests && selectedSubtestIds.length === 0) {
      toast({
        title: "Select subtests",
        description: "Please select at least one subtest, or click 'Start Empty' to pick during session.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Use the first selected subtest as the starting point (or null for live picking)
      const firstSubtestId = selectedSubtestIds.length > 0 ? selectedSubtestIds[0] : null;
      
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          student_id: selectedStudentId,
          assessor_id: user.user?.id,
          status: "scheduled",
          current_subtest_id: firstSubtestId,
          // Store selected subtest IDs in observations (empty array for live picking)
          observations: { selected_subtests: selectedSubtestIds },
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
        setSelectedSubtestIds([]);
        toast({
          title: "Session created",
          description: skipSubtests 
            ? "Session created - pick assessments live from the cockpit."
            : `Session created with ${selectedSubtestIds.length} subtest(s).`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
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
                
                <div className="space-y-3">
                  <Label>Select Subtests</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-3">
                    {readingCategories.map((category) => {
                      const catSubtests = subtestsByCategory[category.id] || [];
                      if (catSubtests.length === 0) return null;
                      return (
                        <div key={category.id} className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                          <div className="space-y-1 pl-2">
                            {catSubtests.map((subtest) => (
                              <label 
                                key={subtest.id} 
                                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSubtestIds.includes(subtest.id)}
                                  onChange={() => toggleSubtest(subtest.id)}
                                  className="rounded"
                                />
                                <span className="flex-1">{subtest.name}</span>
                                {subtest.grade && (
                                  <Badge variant="outline" className="text-xs">{subtest.grade}</Badge>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedSubtestIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedSubtestIds.length} subtest(s) selected
                    </p>
                  )}
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
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => createSession(true)} 
                  disabled={!selectedStudentId || isCreating}
                >
                  Start Empty (Pick Live)
                </Button>
                <Button 
                  onClick={() => createSession(false)} 
                  disabled={!selectedStudentId || selectedSubtestIds.length === 0 || isCreating}
                >
                  {isCreating ? "Creating..." : `Create Session (${selectedSubtestIds.length})`}
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
          <div className="flex flex-col sm:flex-row gap-2">
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
