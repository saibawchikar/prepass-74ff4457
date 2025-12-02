import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, Upload } from "lucide-react";

interface NoteInputProps {
  onGenerate: (notes: string) => void;
  isLoading?: boolean;
}

export const NoteInput = ({ onGenerate, isLoading }: NoteInputProps) => {
  const [notes, setNotes] = useState("");

  const handleGenerate = () => {
    if (notes.trim()) {
      onGenerate(notes);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Paste your notes here... You can add definitions, formulas, key concepts, or any study material you want to learn."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[200px] resize-none rounded-xl border-2 border-border bg-card p-4 text-base focus:border-primary focus:ring-primary/20 transition-all"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-muted-foreground">
          <span className="text-xs">{notes.length} characters</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="gradient"
          size="lg"
          onClick={handleGenerate}
          disabled={!notes.trim() || isLoading}
          className="flex-1 sm:flex-none"
        >
          <Sparkles className="w-5 h-5" />
          {isLoading ? "Generating..." : "Generate Flashcards"}
        </Button>
        
        <Button variant="outline" size="lg" className="flex-1 sm:flex-none" disabled>
          <Upload className="w-5 h-5" />
          Upload PDF
        </Button>
        
        <Button variant="outline" size="lg" className="flex-1 sm:flex-none" disabled>
          <FileText className="w-5 h-5" />
          Scan Notes
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: The more detailed your notes, the better the flashcards will be!
      </p>
    </div>
  );
};
