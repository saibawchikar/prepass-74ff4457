import { useState } from "react";
import { NoteInput } from "./NoteInput";
import { Button } from "./ui/button";
import { FileText, Sparkles, Trash2 } from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  flashcardsGenerated: number;
}

interface NotesViewProps {
  onGenerateFlashcards: (notes: string) => void;
}

export const NotesView = ({ onGenerateFlashcards }: NotesViewProps) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Photosynthesis is the process by which plants convert light energy into chemical energy. The equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2. It occurs in chloroplasts, specifically in the thylakoid membranes and stroma.",
      createdAt: new Date(Date.now() - 86400000),
      flashcardsGenerated: 5,
    },
    {
      id: "2",
      content: "Newton's Laws of Motion: 1) An object at rest stays at rest unless acted upon by a force. 2) F = ma (Force equals mass times acceleration). 3) For every action, there is an equal and opposite reaction.",
      createdAt: new Date(Date.now() - 172800000),
      flashcardsGenerated: 4,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (content: string) => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const newNote: Note = {
        id: Date.now().toString(),
        content,
        createdAt: new Date(),
        flashcardsGenerated: Math.floor(Math.random() * 5) + 3,
      };
      setNotes([newNote, ...notes]);
      setIsLoading(false);
      onGenerateFlashcards(content);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Input Section */}
      <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-card">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          Add New Notes
        </h2>
        <NoteInput onGenerate={handleGenerate} isLoading={isLoading} />
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Your Notes ({notes.length})
        </h2>
        
        {notes.length === 0 ? (
          <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No notes yet</h3>
            <p className="text-muted-foreground mt-1">Add your first notes above to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-card transition-all group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground line-clamp-3">{note.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{note.createdAt.toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {note.flashcardsGenerated} flashcards
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
