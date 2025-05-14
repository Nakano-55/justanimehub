'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Globe } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import { AuthButton } from './AuthButton';

interface TranslationDialogProps {
  entityId: number;
  entityType: 'anime' | 'character';
  contentType: 'character_description' | 'anime_synopsis' | 'anime_background';
  originalContent: string;
  language: 'en' | 'id';
}

export function TranslationDialog({ 
  entityId, 
  entityType,
  contentType, 
  originalContent, 
  language 
}: TranslationDialogProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const supabase = createClientComponentClient<Database>();

  // Check authentication status when component mounts
  supabase.auth.onAuthStateChange((event, session) => {
    setIsAuthenticated(!!session);
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to submit content');
        return;
      }

      const { error: submitError } = await supabase
        .from('content_versions')
        .insert({
          entity_id: entityId,
          entity_type: entityType,
          content_type: contentType,
          language,
          content: content.trim(),
          created_by: user.id,
          status: 'pending'
        });

      if (submitError) throw submitError;

      setSuccess(true);
      setContent('');
    } catch (err) {
      setError('Failed to submit content. Please try again.');
      console.error('Content submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <AuthButton />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
          <Globe className="w-4 h-4 mr-2" />
          Add {language === 'en' ? 'English' : 'Indonesian'} Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle>Submit Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Original Content:</h4>
            <div className="bg-neutral-800 rounded-lg p-4 text-sm text-neutral-300">
              {originalContent}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Your Version:</h4>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter your ${language === 'en' ? 'English' : 'Indonesian'} version...`}
              className="h-32 bg-neutral-800 border-neutral-700 text-white"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-sm">
              Content submitted successfully! It will be reviewed before being published.
            </p>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || success}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Content'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
