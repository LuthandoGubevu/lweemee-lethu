"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader, Smile, Frown, Meh } from 'lucide-react';
import { analyzeCommentSentiment, AnalyzeCommentSentimentOutput } from '@/ai/flows/analyze-comment-sentiment';
import { useToast } from "@/hooks/use-toast"

const sentimentIcons = {
  positive: <Smile className="h-10 w-10 text-green-500" />,
  negative: <Frown className="h-10 w-10 text-red-500" />,
  neutral: <Meh className="h-10 w-10 text-yellow-500" />,
};

export function SentimentDemo() {
  const [comment, setComment] = useState('This is the best product I have ever used!');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeCommentSentimentOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!comment.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a comment to analyze.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await analyzeCommentSentiment({ comment });
      setResult(analysisResult);
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="mx-auto max-w-3xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">See Our AI in Action</CardTitle>
            <CardDescription className="md:text-xl">
              Type a TikTok comment below to see how our AI understands audience sentiment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Textarea
                placeholder="e.g., 'Love this!', 'Not a fan...', or 'Interesting point'"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] text-base"
              />
              <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Sentiment'
                )}
              </Button>
              {result && (
                <div className="mt-4 rounded-lg border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <div>{sentimentIcons[result.sentiment]}</div>
                    <div>
                      <p className="text-2xl font-bold capitalize font-headline">{result.sentiment}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
