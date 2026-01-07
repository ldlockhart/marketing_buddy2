import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Mail,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointerClick,
  Plus,
  Heart
} from 'lucide-react';

interface Analytics {
  totalCampaigns: number;
  totalAudiences: number;
  totalRevenue: number;
  averageOpenRate: number;
  averageClickRate: number;
  recentCampaigns: any[];
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalCampaigns: 0,
    totalAudiences: 0,
    totalRevenue: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    recentCampaigns: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [campaigns, audiences, campaignAnalytics, recentCampaigns] = await Promise.all([
        supabase.from('campaigns').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('audiences').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase
          .from('campaign_analytics')
          .select('*, campaigns!inner(user_id)')
          .eq('campaigns.user_id', user.id),
        supabase
          .from('campaigns')
          .select('*, campaign_analytics(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const totalRevenue = campaignAnalytics.data?.reduce(
        (sum, ca) => sum + parseFloat(ca.revenue_generated || 0),
        0
      ) || 0;

      const openRates = campaignAnalytics.data
        ?.filter((ca) => ca.sent_count > 0)
        .map((ca) => (ca.opened_count / ca.sent_count) * 100) || [];

      const clickRates = campaignAnalytics.data
        ?.filter((ca) => ca.opened_count > 0)
        .map((ca) => (ca.clicked_count / ca.opened_count) * 100) || [];

      const averageOpenRate =
        openRates.length > 0 ? openRates.reduce((a, b) => a + b, 0) / openRates.length : 0;

      const averageClickRate =
        clickRates.length > 0 ? clickRates.reduce((a, b) => a + b, 0) / clickRates.length : 0;

      setAnalytics({
        totalCampaigns: campaigns.count || 0,
        totalAudiences: audiences.count || 0,
        totalRevenue,
        averageOpenRate,
        averageClickRate,
        recentCampaigns: recentCampaigns.data || [],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Campaigns',
      value: analytics.totalCampaigns,
      icon: Mail,
      color: 'from-blue-400 to-cyan-400',
      change: '+12%',
      isPositive: true,
    },
    {
      label: 'Audiences',
      value: analytics.totalAudiences,
      icon: Users,
      color: 'from-green-400 to-emerald-400',
      change: '+8%',
      isPositive: true,
    },
    {
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-orange-400 to-pink-400',
      change: '+23%',
      isPositive: true,
    },
    {
      label: 'Avg Open Rate',
      value: `${analytics.averageOpenRate.toFixed(1)}%`,
      icon: Eye,
      color: 'from-purple-400 to-pink-400',
      change: '-2%',
      isPositive: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Heart className="w-8 h-8 text-orange-400 fill-orange-400" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
        </div>
        <p className="text-gray-600">Here's what's happening with your campaigns today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Performance Overview</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Open Rate</span>
                <span className="text-sm font-semibold text-gray-800">
                  {analytics.averageOpenRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.averageOpenRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Click Rate</span>
                <span className="text-sm font-semibold text-gray-800">
                  {analytics.averageClickRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.averageClickRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-xl font-bold">Revenue Insights</h2>
          </div>
          <p className="text-3xl font-bold mb-2">
            ${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-white/80 mb-4">Total revenue generated</p>
          <Link
            to="/revenue"
            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            <span>View Predictions</span>
            <ArrowUp className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Campaigns</h2>
          <Link
            to="/campaigns"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>

        {analytics.recentCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No campaigns yet</p>
            <Link
              to="/campaigns"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sent</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Opens</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentCampaigns.map((campaign) => {
                  const stats = campaign.campaign_analytics?.[0];
                  return (
                    <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">{campaign.name}</p>
                        <p className="text-sm text-gray-500">{campaign.subject}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'sent'
                              ? 'bg-green-100 text-green-700'
                              : campaign.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{stats?.sent_count || 0}</td>
                      <td className="py-3 px-4 text-gray-700">{stats?.opened_count || 0}</td>
                      <td className="py-3 px-4 text-gray-700">{stats?.clicked_count || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
