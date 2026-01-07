import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Mail,
  Calendar,
  Users,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Palette
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
  campaign_analytics?: Array<{
    sent_count: number;
    opened_count: number;
    clicked_count: number;
  }>;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaigns')
        .select('*, campaign_analytics(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Campaigns</h1>
          <p className="text-gray-600">Create and manage your email campaigns</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition transform hover:scale-105 shadow-md font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No campaigns yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by creating your first email campaign. Reach your audience and track your results.
          </p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition transform hover:scale-105 shadow-md font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => {
            const stats = campaign.campaign_analytics?.[0];
            const openRate = stats && stats.sent_count > 0
              ? ((stats.opened_count / stats.sent_count) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.subject}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {campaign.sent_at
                            ? `Sent ${new Date(campaign.sent_at).toLocaleDateString()}`
                            : campaign.scheduled_at
                            ? `Scheduled ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                            : `Created ${new Date(campaign.created_at).toLocaleDateString()}`}
                        </span>
                      </div>
                      {stats && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{stats.sent_count} recipients</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/campaigns/${campaign.id}/editor`)}
                      className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="Design email"
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                      title="Edit campaign"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {stats && (
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Sent</p>
                      <p className="text-xl font-bold text-gray-800">{stats.sent_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Opens</p>
                      <p className="text-xl font-bold text-gray-800">{stats.opened_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Clicks</p>
                      <p className="text-xl font-bold text-gray-800">{stats.clicked_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Open Rate</p>
                      <p className="text-xl font-bold text-gray-800">{openRate}%</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
