import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  strength: "weak" | "okay" | "strong";
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [importantPoints, setImportantPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setFlashcards([]);
      setQuizzes([]);
      setImportantPoints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [flashcardsRes, quizzesRes, pointsRes] = await Promise.all([
        supabase.from('flashcards').select('*').eq('user_id', user.id),
        supabase.from('quizzes').select('*').eq('user_id', user.id),
        supabase.from('important_points').select('*').eq('user_id', user.id),
      ]);

      if (flashcardsRes.data) {
        setFlashcards(flashcardsRes.data.map(fc => ({
          id: fc.id,
          front: fc.front,
          back: fc.back,
          strength: fc.strength as "weak" | "okay" | "strong",
        })));
      }

      if (quizzesRes.data) {
        setQuizzes(quizzesRes.data.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          correctIndex: q.correct_index,
        })));
      }

      if (pointsRes.data) {
        setImportantPoints(pointsRes.data.map(p => p.content));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addFlashcards = async (newFlashcards: Array<{ front: string; back: string }>) => {
    if (!user) return;

    const toInsert = newFlashcards.map(fc => ({
      front: fc.front,
      back: fc.back,
      user_id: user.id,
      strength: 'weak',
    }));

    const { data, error } = await supabase
      .from('flashcards')
      .insert(toInsert)
      .select();

    if (error) {
      toast.error('Failed to save flashcards');
      return;
    }

    if (data) {
      setFlashcards(prev => [...prev, ...data.map(fc => ({
        id: fc.id,
        front: fc.front,
        back: fc.back,
        strength: fc.strength as "weak" | "okay" | "strong",
      }))]);
    }
  };

  const addQuizzes = async (newQuizzes: Array<{ question: string; options: string[]; correctIndex: number }>) => {
    if (!user) return;

    const toInsert = newQuizzes.map(q => ({
      question: q.question,
      options: q.options,
      correct_index: q.correctIndex,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('quizzes')
      .insert(toInsert)
      .select();

    if (error) {
      toast.error('Failed to save quizzes');
      return;
    }

    if (data) {
      setQuizzes(prev => [...prev, ...data.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correctIndex: q.correct_index,
      }))]);
    }
  };

  const addImportantPoints = async (points: string[]) => {
    if (!user) return;

    const toInsert = points.map(content => ({
      content,
      user_id: user.id,
    }));

    const { error } = await supabase
      .from('important_points')
      .insert(toInsert);

    if (error) {
      toast.error('Failed to save important points');
      return;
    }

    setImportantPoints(prev => [...prev, ...points]);
  };

  const updateFlashcard = async (id: string, strength: "weak" | "okay" | "strong") => {
    if (!user) return;

    const { error } = await supabase
      .from('flashcards')
      .update({ strength })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update flashcard');
      return;
    }

    setFlashcards(prev => prev.map(fc => fc.id === id ? { ...fc, strength } : fc));
  };

  const deleteAllData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        supabase.from('flashcards').delete().eq('user_id', user.id),
        supabase.from('quizzes').delete().eq('user_id', user.id),
        supabase.from('important_points').delete().eq('user_id', user.id),
      ]);

      setFlashcards([]);
      setQuizzes([]);
      setImportantPoints([]);
      toast.success('All data deleted successfully');
    } catch (error) {
      toast.error('Failed to delete data');
    }
  };

  return {
    flashcards,
    quizzes,
    importantPoints,
    loading,
    addFlashcards,
    addQuizzes,
    addImportantPoints,
    updateFlashcard,
    deleteAllData,
    setFlashcards,
  };
};
