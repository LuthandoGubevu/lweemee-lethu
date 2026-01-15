'use server';

/**
 * @fileOverview Sentiment analysis of TikTok comments using Genkit.
 *
 * - analyzeCommentSentiment - Analyzes the sentiment of a given comment.
 * - AnalyzeCommentSentimentInput - Input type for the sentiment analysis.
 * - AnalyzeCommentSentimentOutput - Output type containing the sentiment and confidence.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCommentSentimentInputSchema = z.object({
  comment: z.string().describe('The TikTok comment to analyze.'),
});

export type AnalyzeCommentSentimentInput = z.infer<typeof AnalyzeCommentSentimentInputSchema>;

const AnalyzeCommentSentimentOutputSchema = z.object({
  sentiment: z
    .enum(['positive', 'negative', 'neutral'])
    .describe('The sentiment of the comment.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the sentiment analysis (0 to 1).'),
});

export type AnalyzeCommentSentimentOutput = z.infer<typeof AnalyzeCommentSentimentOutputSchema>;

export async function analyzeCommentSentiment(
  input: AnalyzeCommentSentimentInput
): Promise<AnalyzeCommentSentimentOutput> {
  return analyzeCommentSentimentFlow(input);
}

const analyzeCommentSentimentPrompt = ai.definePrompt({
  name: 'analyzeCommentSentimentPrompt',
  input: {schema: AnalyzeCommentSentimentInputSchema},
  output: {schema: AnalyzeCommentSentimentOutputSchema},
  prompt: `Determine the sentiment of the following TikTok comment. Output "positive", "negative", or "neutral" for the sentiment, and a confidence level between 0 and 1. Return as a valid json:

Comment: {{{comment}}}`,
});

const analyzeCommentSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeCommentSentimentFlow',
    inputSchema: AnalyzeCommentSentimentInputSchema,
    outputSchema: AnalyzeCommentSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeCommentSentimentPrompt(input);
    return output!;
  }
);
