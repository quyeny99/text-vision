'use server';

/**
 * @fileOverview An AI-powered text correction flow for OCR output.
 *
 * - correctText - A function that corrects OCR misrecognitions and suggests punctuation.
 * - CorrectTextInput - The input type for the correctText function.
 * - CorrectTextOutput - The return type for the correctText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectTextInputSchema = z.object({
  text: z.string().describe('The text to correct.'),
});
export type CorrectTextInput = z.infer<typeof CorrectTextInputSchema>;

const CorrectTextOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text.'),
});
export type CorrectTextOutput = z.infer<typeof CorrectTextOutputSchema>;

export async function correctText(input: CorrectTextInput): Promise<CorrectTextOutput> {
  return correctTextFlow(input);
}

const correctTextPrompt = ai.definePrompt({
  name: 'correctTextPrompt',
  input: {schema: CorrectTextInputSchema},
  output: {schema: CorrectTextOutputSchema},
  prompt: `Correct the following text, which was extracted from an image using OCR.  Correct common OCR misrecognitions and suggest punctuation where appropriate to create a more accurate and polished output:\n\n{{{text}}}`,
});

const correctTextFlow = ai.defineFlow(
  {
    name: 'correctTextFlow',
    inputSchema: CorrectTextInputSchema,
    outputSchema: CorrectTextOutputSchema,
  },
  async input => {
    const {output} = await correctTextPrompt(input);
    return output!;
  }
);
