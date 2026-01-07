import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Mail,
  Users,
  Palette
} from 'lucide-react';

interface Audience {
  id: string;
  name: string;
  subscriber_count: number;
}

export default function CampaignBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    from_email: '',
    from_name: '',
    audience_id: '',
    template_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  useEffect(() => {
    loadAudiences();
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadAudiences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('audiences')
        .select('id, name, subscriber_count')
        .eq('user_id', user.id)
        .order('name');

      setAudiences(data || []);
    } catch (error) {
      console.error('Error loading audiences:', error);
    }
  };

  const loadCampaign = async () => {
    try {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setFormData({
          name: data.name,
          subject: data.subject,
          from_email: data.from_email,
          from_name: data.from_name,
          audience_id: data.audience_id || '',
          template_id: data.template_id || '',
        });
        setCampaignId(data.id);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    }
  };

  const saveCampaignDetails = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const campaignData = {
        user_id: user.id,
        name: formData.name,
        subject: formData.subject,
        from_email: formData.from_email,
        from_name: formData.from_name,
        audience_id: formData.audience_id || null,
        status: 'draft',
        updated_at: new Date().toISOString(),
      };

      if (id) {
        await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', id);
        navigate(`/campaigns/${id}/editor`);
      } else {
        const { data, error } = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          navigate(`/campaigns/${data.id}/editor`);
        }
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const launchEditor = () => {
    if (campaignId) {
      navigate(`/campaigns/${campaignId}/editor`);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Campaigns</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {id ? 'Edit Campaign' : 'Create Campaign'}
          </h1>
          <p className="text-gray-600">Set up your campaign details</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                placeholder="e.g., Summer Sale 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                placeholder="e.g., Don't miss our summer deals!"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="e.g., Marketing Team"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="e.g., hello@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.audience_id}
                  onChange={(e) => setFormData({ ...formData, audience_id: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select an audience</option>
                  {audiences.map((audience) => (
                    <option key={audience.id} value={audience.id}>
                      {audience.name} ({audience.subscriber_count.toLocaleString()} subscribers)
                    </option>
                  ))}
                </select>
              </div>
              {audiences.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No audiences yet.{' '}
                  <button
                    onClick={() => navigate('/audiences')}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>
          </div>

          {campaignId && (
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Palette className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-gray-800">Ready to design your email?</p>
                    <p className="text-sm text-gray-600">Launch the email editor to create beautiful emails</p>
                  </div>
                </div>
                <button
                  onClick={launchEditor}
                  className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition font-semibold shadow-md transform hover:scale-105"
                >
                  Launch Email Editor
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => navigate('/campaigns')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={saveCampaignDetails}
              disabled={loading || !formData.name || !formData.subject || !formData.from_email || !formData.from_name}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : campaignId ? 'Save Changes' : 'Save & Launch Editor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
