import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateCoverLinkProps {
  sessionId: string;
  studentName?: string;
}

export function GenerateCoverLink({ sessionId, studentName }: GenerateCoverLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      // Generate a secure random token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Hash the token for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Store the hashed token
      const { error } = await supabase
        .from('assessor_session_tokens')
        .insert({
          session_id: sessionId,
          token_hash: tokenHash,
        });

      if (error) throw error;

      // Generate the link with the raw token
      const link = `${window.location.origin}/session/cover?token=${token}`;
      setGeneratedLink(link);
      toast.success('Cover link generated! Valid for 24 hours.');
    } catch (error) {
      console.error('Failed to generate link:', error);
      toast.error('Failed to generate cover link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Cover Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Substitute Assessor Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a secure, one-time link for a substitute assessor to conduct 
            {studentName ? ` ${studentName}'s` : ' this'} session.
          </p>
          
          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <p><strong>Access includes:</strong></p>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Assessor cockpit for this session only</li>
              <li>Ability to score responses</li>
              <li>Session timer and prompts</li>
            </ul>
            <p className="mt-2"><strong>Link expires:</strong> 24 hours</p>
          </div>

          {!generatedLink ? (
            <Button 
              onClick={generateLink} 
              disabled={isGenerating}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Secure Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={generatedLink} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with your substitute. They can access the session immediately.
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setGeneratedLink(null);
                  generateLink();
                }}
                className="w-full"
              >
                Generate New Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
