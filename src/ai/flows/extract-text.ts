'use server';

/**
 * @fileOverview An AI-powered text extraction flow.
 *
 * - extractText - A function that extracts text from an image.
 * - ExtractTextInput - The input type for the extractText function.
 * - ExtractTextOutput - The return type for the extractText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextInput = z.infer<typeof ExtractTextInputSchema>;

const ExtractTextOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the image.'),
});
export type ExtractTextOutput = z.infer<typeof ExtractTextOutputSchema>;

export async function extractText(input: ExtractTextInput): Promise<ExtractTextOutput> {
  return extractTextFlow(input);
}

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: {schema: ExtractTextInputSchema},
  output: {schema: ExtractTextOutputSchema},
  prompt: `You are an expert at performing OCR (Optical Character Recognition). Extract all text from the following image.

Photo: {{media url=imageDataUri}}`,
});

const extractTextFlow = ai.defineFlow(
  {
    name: 'extractTextFlow',
    inputSchema: ExtractTextInputSchema,
    outputSchema: ExtractTextOutputSchema,
  },
  async input => {
    const {output} = await extractTextPrompt(input);
    return output!;
  }
);
