import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { FileText, Sparkles, Upload, Image, Loader2, X } from "lucide-react";
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

export const NotesView = ({ onGenerateFlashcards }: NotesViewProps) => {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      toast.success("Image uploaded! Click 'Analyze Notes' to process.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!notes.trim() && !uploadedImage) {
      toast.error("Please add notes or upload an image");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-notes", {
        body: {
          imageBase64: uploadedImage,
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
      setUploadedImage(null);
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

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

        {/* Image Upload Area */}
        {uploadedImage ? (
          <div className="mb-4 relative">
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-primary/5">
              <img
                src={uploadedImage}
                alt="Uploaded notes"
                className="w-full max-h-64 object-contain"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Image ready for OCR analysis
            </p>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">Upload notes image</p>
            <p className="text-sm text-muted-foreground mt-1">
              Take a photo of your handwritten or printed notes
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
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
            disabled={(!notes.trim() && !uploadedImage) || isLoading}
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
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Tip: Upload a clear photo of your notes for best OCR results. The AI will extract text and create flashcards, quizzes, and key points automatically!
        </p>
      </div>
    </div>
  );
};
