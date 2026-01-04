import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, BookOpen, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Subtest = Database['public']['Tables']['subtests']['Row'];

interface PassageForm {
  name: string;
  grade: string;
  passage: string;
  wordCount: number;
  scriptPrompt: string;
}

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const ORF_ASSESSMENT_ID = 'a1b2c3d4-0001-4567-89ab-cdef01234567';

const DEFAULT_SCRIPT = `This is a story about [topic]. I want you to read this story to me. You'll have 1 minute to read as much as you can. When I say "begin," start reading aloud at the top of the page. Do your best reading. If you have trouble with a word, I'll tell it to you. Do you have any questions? Begin.`;

export default function PassageManager() {
  const queryClient = useQueryClient();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubtest, setEditingSubtest] = useState<Subtest | null>(null);
  const [deleteSubtest, setDeleteSubtest] = useState<Subtest | null>(null);
  const [form, setForm] = useState<PassageForm>({
    name: '',
    grade: '1',
    passage: '',
    wordCount: 0,
    scriptPrompt: DEFAULT_SCRIPT,
  });

  // Fetch ORF passages
  const { data: passages, isLoading } = useQuery({
    queryKey: ['orf-passages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtests')
        .select('*')
        .eq('assessment_id', ORF_ASSESSMENT_ID)
        .eq('module_type', 'orf')
        .order('grade')
        .order('order_index');
      
      if (error) throw error;
      return data as Subtest[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: PassageForm & { id?: string }) => {
      const stimulusData = {
        items: [{ passage: data.passage, word_count: data.wordCount }],
      };

      if (data.id) {
        // Update
        const { error } = await supabase
          .from('subtests')
          .update({
            name: data.name,
            grade: data.grade,
            script_prompt: data.scriptPrompt,
            stimulus_data: stimulusData,
            item_count: data.wordCount,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        // Get max order_index for grade
        const { data: existing } = await supabase
          .from('subtests')
          .select('order_index')
          .eq('assessment_id', ORF_ASSESSMENT_ID)
          .eq('grade', data.grade)
          .order('order_index', { ascending: false })
          .limit(1);
        
        const nextIndex = existing?.[0]?.order_index ? existing[0].order_index + 1 : 1;

        const { error } = await supabase
          .from('subtests')
          .insert({
            assessment_id: ORF_ASSESSMENT_ID,
            name: data.name,
            grade: data.grade,
            module_type: 'orf',
            script_prompt: data.scriptPrompt,
            stimulus_data: stimulusData,
            item_count: data.wordCount,
            order_index: nextIndex,
            timing_config: { duration_seconds: 60 },
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orf-passages'] });
      toast.success(editingSubtest ? 'Passage updated' : 'Passage created');
      closeDialog();
    },
    onError: (err) => {
      toast.error(`Failed to save: ${err.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subtests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orf-passages'] });
      toast.success('Passage deleted');
      setDeleteSubtest(null);
    },
    onError: (err) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });

  const openCreateDialog = () => {
    setEditingSubtest(null);
    setForm({
      name: '',
      grade: '1',
      passage: '',
      wordCount: 0,
      scriptPrompt: DEFAULT_SCRIPT,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (subtest: Subtest) => {
    setEditingSubtest(subtest);
    const stimData = subtest.stimulus_data as { items?: Array<{ passage?: string; word_count?: number }> } | null;
    const item = stimData?.items?.[0];
    
    setForm({
      name: subtest.name,
      grade: subtest.grade || '1',
      passage: item?.passage || '',
      wordCount: item?.word_count || subtest.item_count || 0,
      scriptPrompt: subtest.script_prompt || DEFAULT_SCRIPT,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSubtest(null);
  };

  const handlePassageChange = (text: string) => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    setForm(prev => ({
      ...prev,
      passage: text,
      wordCount: words.length,
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.passage.trim()) {
      toast.error('Name and passage text are required');
      return;
    }
    saveMutation.mutate({
      ...form,
      id: editingSubtest?.id,
    });
  };

  const filteredPassages = passages?.filter(p => 
    selectedGrade === 'all' || p.grade === selectedGrade
  ) || [];

  const groupedByGrade = filteredPassages.reduce((acc, p) => {
    const grade = p.grade || 'Unknown';
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(p);
    return acc;
  }, {} as Record<string, Subtest[]>);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Passage Manager</h1>
            <p className="text-muted-foreground">
              Add, edit, or delete ORF fluency passages
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Passage
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Label>Filter by Grade:</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {GRADES.map(g => (
                <SelectItem key={g} value={g}>Grade {g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredPassages.length} passage{filteredPassages.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Passages List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByGrade)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([grade, gradePassages]) => (
                <div key={grade}>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Grade {grade}
                    <Badge variant="secondary">{gradePassages.length}</Badge>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gradePassages.map(passage => {
                      const stimData = passage.stimulus_data as { items?: Array<{ passage?: string }> } | null;
                      const preview = stimData?.items?.[0]?.passage?.slice(0, 120) || '';
                      
                      return (
                        <Card key={passage.id} className="group">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{passage.name}</CardTitle>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditDialog(passage)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => setDeleteSubtest(passage)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {preview}...
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {passage.item_count} words
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            
            {filteredPassages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No passages found</p>
                <Button variant="link" onClick={openCreateDialog}>
                  Add your first passage
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingSubtest ? 'Edit Passage' : 'Add New Passage'}
              </DialogTitle>
              <DialogDescription>
                {editingSubtest 
                  ? 'Update the passage details below'
                  : 'Create a new ORF fluency passage'}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Passage Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., The Lost Puppy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select 
                      value={form.grade} 
                      onValueChange={v => setForm(prev => ({ ...prev, grade: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map(g => (
                          <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passage">Passage Text</Label>
                    <span className="text-sm text-muted-foreground">
                      {form.wordCount} words
                    </span>
                  </div>
                  <Textarea
                    id="passage"
                    value={form.passage}
                    onChange={e => handlePassageChange(e.target.value)}
                    placeholder="Enter the passage text here..."
                    className="min-h-[200px] font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="script">Script Prompt (for assessor)</Label>
                  <Textarea
                    id="script"
                    value={form.scriptPrompt}
                    onChange={e => setForm(prev => ({ ...prev, scriptPrompt: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Passage'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteSubtest} onOpenChange={() => setDeleteSubtest(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Passage</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteSubtest?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteSubtest && deleteMutation.mutate(deleteSubtest.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
