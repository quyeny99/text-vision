"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Copy, Check, Sparkles, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleCorrectText, handleExtractText } from "./actions";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isCorrecting, startCorrectionTransition] = useTransition();
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const extractTextFromImage = async (dataUri: string) => {
    setIsExtracting(true);
    setText("");
    try {
      const result = await handleExtractText(dataUri);
      if (result.extractedText) {
        setText(result.extractedText);
      } else {
        throw new Error("Extraction failed to return text.");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to extract text from the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };


  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        extractTextFromImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const onCorrectText = () => {
    if (!text) return;
    startCorrectionTransition(async () => {
      try {
        const result = await handleCorrectText(text);
        if (result.correctedText) {
          setText(result.correctedText);
          toast({
            title: "Success",
            description: "Text corrected successfully.",
          });
        } else {
            throw new Error("Correction failed.");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to correct text. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const onCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center font-headline">TextVision</h1>
          <p className="text-center text-muted-foreground mt-2">Upload an image to extract and correct text.</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>1. Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer hover:border-primary hover:bg-accent ${isDragging ? 'border-primary bg-accent' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
                {imagePreview ? (
                  <div className="relative w-full h-64">
                    <Image src={imagePreview} alt="Uploaded preview" layout="fill" objectFit="contain" className="rounded-md" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 h-64">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="font-semibold">Drag & drop an image here</p>
                    <p className="text-muted-foreground text-sm">or click to select a file</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Extracted & Corrected Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-full min-h-[294px] flex flex-col">
                <Textarea
                  placeholder="Extracted text will appear here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-grow text-base resize-none"
                  readOnly={isExtracting || isCorrecting}
                />
                {(isExtracting || isCorrecting) && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-md">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-2 mt-4 text-muted-foreground">{isExtracting ? 'Extracting text...' : 'Correcting text...'}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={onCorrectText} disabled={!text || isCorrecting || isExtracting}>
                  {isCorrecting ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  <span>Correct with AI</span>
                </Button>
                <Button onClick={onCopyText} variant="outline" disabled={!text}>
                  {hasCopied ? <Check /> : <Copy />}
                  <span>{hasCopied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
