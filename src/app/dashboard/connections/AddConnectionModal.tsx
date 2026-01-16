'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clapperboard, Camera, Upload, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Platform = 'tiktok' | 'instagram';
type Method = 'handle' | 'import' | 'oauth';

interface AddConnectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: (platform: Platform, method: Method) => void;
}

export function AddConnectionModal({ isOpen, onOpenChange, onComplete }: AddConnectionModalProps) {
  const [step, setStep] = useState<'platform' | 'method'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep('method');
  };

  const handleMethodSelect = (method: Method) => {
    if (selectedPlatform && method !== 'oauth') {
      onComplete(selectedPlatform, method);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setStep('platform');
    setSelectedPlatform(null);
    onOpenChange(false);
  };
  
  const handleBack = () => {
      setStep('platform');
      setSelectedPlatform(null);
  }

  const handleOpenChange = (open: boolean) => {
      if (!open) {
          resetAndClose();
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent onEscapeKeyDown={resetAndClose} onPointerDownOutside={resetAndClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {step === 'method' && (
                <Button variant="ghost" size="icon" className="mr-2" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            {step === 'platform' ? 'Add a new connection' : `Connect ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'platform' && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* TikTok Platform Card */}
            <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent" onClick={() => handlePlatformSelect('tiktok')}>
                <Clapperboard className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold">TikTok</h3>
                <p className="text-sm text-muted-foreground">Track a public profile.</p>
            </Card>
            {/* Instagram Platform Card */}
             <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent" onClick={() => handlePlatformSelect('instagram')}>
                <Camera className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold">Instagram</h3>
                 <p className="text-sm text-muted-foreground">Track a public profile.</p>
            </Card>
          </div>
        )}

        {step === 'method' && (
          <div className="grid gap-4 pt-4">
            {/* Handle Method */}
            <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accent" onClick={() => handleMethodSelect('handle')}>
                <LinkIcon className="h-8 w-8 text-primary" />
                <div>
                    <h3 className="font-semibold">Connect via Handle</h3>
                    <p className="text-sm text-muted-foreground">Track a public profile by its username.</p>
                </div>
            </Card>
             {/* Import Method */}
            <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accent" onClick={() => handleMethodSelect('import')}>
                <Upload className="h-8 w-8 text-primary" />
                <div>
                    <h3 className="font-semibold">Import from CSV</h3>
                    <p className="text-sm text-muted-foreground">Manually upload historical data.</p>
                </div>
            </Card>
             {/* OAuth Method */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className="w-full">
                            <Card className="p-4 flex items-center gap-4 cursor-not-allowed opacity-50 relative">
                                <LinkIcon className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <h3 className="font-semibold text-muted-foreground">Connect via OAuth</h3>
                                    <p className="text-sm text-muted-foreground">Use your account login for deeper insights.</p>
                                </div>
                                <Badge variant="outline" className="absolute top-2 right-2">Coming Soon</Badge>
                            </Card>
                         </div>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>OAuth connections will be enabled after API approval.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
