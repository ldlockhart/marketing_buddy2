import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BeefreeEditor from '../components/BeefreeEditor';
import { ArrowLeft, Heart, Save, X } from 'lucide-react';

export default function EmailEditor() {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const templateId = searchParams.get('templateId');

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    } else {
      setLoading(false);
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSave = async (savedTemplateId: string) => {
    if (campaignId && savedTemplateId) {
      setSaving(true);
      try {
        await supabase
          .from('campaigns')
          .update({ template_id: savedTemplateId })
          .eq('id', campaignId);
      } catch (error) {
        console.error('Error updating campaign template:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleExit = () => {
    if (campaignId) {
      navigate(`/campaigns/${campaignId}/edit`);
    } else {
      navigate('/campaigns');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExit}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Exit editor"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {campaign?.name || 'Email Designer'}
              </h1>
              <p className="text-xs text-gray-500">Marketing Buddy Email Editor</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {saving && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
              <span>Saving...</span>
            </div>
          )}

          <button
            onClick={handleExit}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <X className="w-4 h-4" />
            <span>Exit Editor</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <BeefreeEditor
          templateId={campaign?.template_id || templateId || undefined}
          onSave={handleTemplateSave}
        />
      </div>

      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span>Your changes are automatically saved</span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>Press ESC to exit</span>
          <span>•</span>
          <span>Use Save button in editor toolbar</span>
        </div>
      </footer>
    </div>
  );
}
