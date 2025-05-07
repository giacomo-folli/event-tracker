import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Event } from "@shared/schema";
import { Copy, Facebook, Twitter, Mail, Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventShareDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function EventShareDialog({ event, isOpen, onClose }: EventShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Generate a shareable event URL
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/events/${event.id}`;
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied to clipboard",
      description: "You can now paste and share the event link",
    });
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Handle direct social media sharing
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };
  
  const shareToTwitter = () => {
    const text = `Check out this event: ${event.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };
  
  const shareByEmail = () => {
    const subject = `Invitation: ${event.title}`;
    const body = `
      I'd like to invite you to the following event:
      
      ${event.title}
      Date: ${new Date(event.startDate).toLocaleDateString()} at ${new Date(event.startDate).toLocaleTimeString()}
      Location: ${event.location || "TBA"}
      
      Details: ${event.description || ""}
      
      You can view the full event here: ${shareUrl}
    `;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5" />
            Share Event
          </DialogTitle>
          <DialogDescription>
            Share "{event.title}" with others via link or social media
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="share-link" className="sr-only">
                Share Link
              </Label>
              <Input
                id="share-link"
                readOnly
                value={shareUrl}
                className="font-mono text-sm"
              />
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={copyToClipboard}
              className="px-3"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label>Share via</Label>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={shareToFacebook}
                className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
                title="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Share on Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={shareToTwitter}
                className="rounded-full bg-sky-500 text-white hover:bg-sky-600"
                title="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Share on Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={shareByEmail}
                className="rounded-full bg-gray-500 text-white hover:bg-gray-600"
                title="Share via Email"
              >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Share via Email</span>
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <div className="flex-1 text-right text-sm text-muted-foreground">
            Sharing made easy
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}