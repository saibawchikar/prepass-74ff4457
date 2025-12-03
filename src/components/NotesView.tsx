import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FileText, Sparkles, Upload, Image, Loader2, X, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedContent {
  flashcards: Array<{ front: string; back: string }>;
  quizzes: Array<{ question: string; options: string[]; correctIndex: number }>;
  importantPoints: string[];
  summary: string;
}

interface NotesViewProps {
  onGenerateFlashcards: (content: GeneratedContent) => void;
}

interface UploadedFile {
  id: string;
  type: "image" | "pdf";
  name: string;
  data: string; // base64 for both images and PDFs
  preview?: string;
}

export const NotesView = ({ onGenerateFlashcards }: NotesViewProps) => {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - uploadedFiles.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsProcessingFile(true);

    try {
      const newFiles: UploadedFile[] = [];

      for (const file of filesToProcess) {
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";

        if (!isImage && !isPDF) {
          toast.error(`${file.name}: Only images and PDFs are supported`);
          continue;
        }

        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name}: File must be less than 20MB`);
          continue;
        }

        const base64 = await readFileAsBase64(file);

        if (isImage) {
          newFiles.push({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "image",
            name: file.name,
            data: base64,
            preview: base64,
          });
        } else if (isPDF) {
          newFiles.push({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "pdf",
            name: file.name,
            data: base64,
          });
        }
      }

      if (newFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} file(s) added!`);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleGenerate = async () => {
    const hasContent = notes.trim() || uploadedFiles.length > 0;
    if (!hasContent) {
      toast.error("Please add notes, images, or PDFs");
      return;
    }

    setIsLoading(true);

    try {
      // Separate images and PDFs
      const images = uploadedFiles.filter((f) => f.type === "image").map((f) => f.data);
      const pdfs = uploadedFiles.filter((f) => f.type === "pdf").map((f) => f.data);

      const { data, error } = await supabase.functions.invoke("analyze-notes", {
        body: {
          imagesBase64: images.length > 0 ? images : null,
          pdfsBase64: pdfs.length > 0 ? pdfs : null,
          textContent: notes.trim() || null,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Failed to analyze notes");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Generated ${data.flashcards?.length || 0} flashcards and ${data.quizzes?.length || 0} quizzes!`);
      onGenerateFlashcards(data);

      // Clear inputs after successful generation
      setNotes("");
      setUploadedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast.error(error.message || "Failed to analyze notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const imageCount = uploadedFiles.filter((f) => f.type === "image").length;
  const pdfCount = uploadedFiles.filter((f) => f.type === "pdf").length;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Input Section */}
      <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-card">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          Add Your Notes
        </h2>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Uploaded Files ({uploadedFiles.length}/10)
              </span>
              <span className="text-xs text-muted-foreground">
                {imageCount > 0 && `${imageCount} image${imageCount > 1 ? "s" : ""}`}
                {imageCount > 0 && pdfCount > 0 && " • "}
                {pdfCount > 0 && `${pdfCount} PDF${pdfCount > 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative group rounded-xl overflow-hidden border-2 border-primary/30 bg-primary/5"
                >
                  {file.type === "image" ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex flex-col items-center justify-center bg-muted">
                      <File className="w-8 h-8 text-primary mb-1" />
                      <span className="text-xs text-muted-foreground px-1 truncate w-full text-center">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Area */}
        {uploadedFiles.length < 10 && (
          <div
            onClick={() => !isProcessingFile && fileInputRef.current?.click()}
            className={`mb-4 border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${
              isProcessingFile ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isProcessingFile ? (
              <Loader2 className="w-10 h-10 mx-auto text-primary mb-3 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-4 mb-3">
                <Image className="w-10 h-10 text-muted-foreground" />
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <p className="text-foreground font-medium">
              {isProcessingFile ? "Processing files..." : "Upload images or PDFs"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drop up to 10 files • Photos of notes, textbook pages, or PDF documents
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf,application/pdf"
          multiple
          className="hidden"
        />

        <div className="relative flex items-center my-4">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-4 text-sm text-muted-foreground">or type/paste notes</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Paste or type your study notes here... Include definitions, formulas, key concepts, or any material you want to learn."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[160px] resize-none rounded-xl border-2 border-border bg-card p-4 text-base focus:border-primary focus:ring-primary/20 transition-all"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">{notes.length} characters</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleGenerate}
            disabled={(!notes.trim() && uploadedFiles.length === 0) || isLoading || isProcessingFile}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Notes
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadedFiles.length >= 10 || isProcessingFile}
          >
            <Upload className="w-5 h-5" />
            Add Files
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Tip: Upload up to 10 images or PDFs at once. The AI will extract text and create flashcards, quizzes, and key points automatically!
        </p>
      </div>
    </div>
  );
};
