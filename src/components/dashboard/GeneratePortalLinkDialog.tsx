import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { Link2, Copy, Check, Loader2, RefreshCw, ExternalLink } from "lucide-react";

interface GeneratePortalLinkDialogProps {
  studentId: string;
  studentName: string;
  parentEmail?: string;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function GeneratePortalLinkDialog({
  studentId,
  studentName,
  parentEmail,
}: GeneratePortalLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [portalLink, setPortalLink] = useState<string | null>(null);
  const [existingToken, setExistingToken] = useState<{
    id: string;
    expires_at: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      checkExistingToken();
    }
  }, [open]);

  const checkExistingToken = async () => {
    const { data, error } = await supabase
      .from("portal_access_tokens")
      .select("id, expires_at")
      .eq("student_id", studentId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setExistingToken(data);
    } else {
      setExistingToken(null);
    }
  };

  const generateNewLink = async () => {
    setIsGenerating(true);
    setPortalLink(null);

    try {
      // Generate a new token
      const token = generateToken();
      const tokenHash = await hashToken(token);

      // Calculate expiry (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Insert the token
      const { error } = await supabase.from("portal_access_tokens").insert({
        student_id: studentId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      // Construct the portal link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/portal?token=${token}`;
      setPortalLink(link);
      
      toast.success("Portal link generated successfully");
      checkExistingToken();
    } catch (error: any) {
      console.error("Error generating portal link:", error);
      toast.error(error.message || "Failed to generate portal link");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!portalLink) return;
    
    try {
      await navigator.clipboard.writeText(portalLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const formatExpiryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start">
          <Link2 className="h-4 w-4 mr-2" />
          Generate Portal Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Parent Portal Access</DialogTitle>
          <DialogDescription>
            Generate a secure link for {studentName}'s parent to access their
            portal and complete assigned scales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {existingToken && !portalLink && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-1">Active Link Exists</p>
              <p className="text-sm text-muted-foreground">
                A portal link is already active and expires on{" "}
                {formatExpiryDate(existingToken.expires_at)}.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Generating a new link will create an additional access token.
              </p>
            </div>
          )}

          {portalLink ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  Link Generated Successfully!
                </p>
                <p className="text-xs text-muted-foreground">
                  This link is valid for 30 days. Share it securely with the parent.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={portalLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {parentEmail && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="text-muted-foreground mb-2">
                    Send to: <span className="font-medium">{parentEmail}</span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const subject = encodeURIComponent(
                        `Portal Access for ${studentName}'s Reading Screening`
                      );
                      const body = encodeURIComponent(
                        `Hello,\n\nYou can access your child's reading screening portal using the following link:\n\n${portalLink}\n\nThis link is valid for 30 days. Please keep it secure.\n\nThank you.`
                      );
                      window.open(`mailto:${parentEmail}?subject=${subject}&body=${body}`);
                    }}
                  >
                    Open Email Draft
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(portalLink, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Portal
              </Button>
            </div>
          ) : (
            <Button
              onClick={generateNewLink}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : existingToken ? (
                <RefreshCw className="h-4 w-4 mr-2" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              {existingToken ? "Generate New Link" : "Generate Portal Link"}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
