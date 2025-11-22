'use server';

import { correctText, type CorrectTextOutput, type CorrectTextInput } from '@/ai/flows/correct-text';
import { extractText, type ExtractTextOutput, type ExtractTextInput } from '@/ai/flows/extract-text';

export async function handleCorrectText(text: string): Promise<CorrectTextOutput> {
  if (!text) {
    throw new Error('Input text cannot be empty.');
  }

  const input: CorrectTextInput = { text };

  try {
    const result = await correctText(input);
    return result;
  } catch (error) {
    console.error('Error in correctText flow:', error);
    throw new Error('Failed to get correction from AI.');
  }
}

export async function handleExtractText(imageDataUri: string): Promise<ExtractTextOutput> {
    if (!imageDataUri) {
        throw new Error('Image data URI cannot be empty.');
    }
    
    const input: ExtractTextInput = { imageDataUri };
    
    try {
        const result = await extractText(input);
        return result;
    } catch (error) {
        console.error('Error in extractText flow:', error);
        throw new Error('Failed to extract text from image.');
    }
}
