import { useEffect, useRef, useState } from 'react';
import BeefreeSDK from '@beefree.io/sdk';
import { supabase } from '../lib/supabase';

interface BeefreeEditorProps {
  templateId?: string;
  onSave?: (templateId: string) => void;
}

export default function BeefreeEditor({ templateId, onSave }: BeefreeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const beeInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeEditor() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('You must be logged in to use the email editor');
          setLoading(false);
          return;
        }

        let existingTemplate = null;
        if (templateId) {
          const { data } = await supabase
            .from('email_templates')
            .select('*')
            .eq('id', templateId)
            .maybeSingle();
          existingTemplate = data;
        }

        const beeConfig = {
          container: 'beefree-editor-container',
          language: 'en-US',
          onSave: async (
            pageJson: string,
            pageHtml: string,
            ampHtml: string | null,
            templateVersion: number,
            language: string | null
          ) => {
            try {
              const templateData = {
                user_id: user.id,
                name: existingTemplate?.name || 'Untitled Template',
                template_json: JSON.parse(pageJson),
                template_html: pageHtml,
                updated_at: new Date().toISOString(),
              };

              if (templateId) {
                await supabase
                  .from('email_templates')
                  .update(templateData)
                  .eq('id', templateId);

                if (onSave) onSave(templateId);
              } else {
                const { data, error } = await supabase
                  .from('email_templates')
                  .insert([templateData])
                  .select()
                  .single();

                if (error) throw error;
                if (onSave && data) onSave(data.id);
              }

              console.log('Template saved successfully!');
            } catch (err) {
              console.error('Error saving template:', err);
              setError('Failed to save template');
            }
          },
          onError: (error: unknown) => {
            console.error('Beefree error:', error);
            setError('An error occurred in the email editor');
          },
        };

        const response = await fetch('http://localhost:3001/proxy/bee-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.id }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with Beefree');
        }

        const token = await response.json();

        const bee = new BeefreeSDK(token);
        beeInstance.current = bee;

        const template = existingTemplate?.template_json || {};

        bee.start(beeConfig, template);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize editor:', err);
        setError(err.message || 'Failed to initialize email editor');
        setLoading(false);
      }
    }

    initializeEditor();

    return () => {
      if (beeInstance.current) {
        try {
          beeInstance.current = null;
        } catch (err) {
          console.error('Error cleaning up Beefree instance:', err);
        }
      }
    };
  }, [templateId, onSave]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading email editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="beefree-editor-container"
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
      }}
    />
  );
}
