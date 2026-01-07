import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface RevenuePrediction {
  id: string;
  campaign_id: string;
  predicted_revenue: number;
  confidence_score: number;
  actual_revenue: number | null;
  prediction_date: string;
  campaigns?: Campaign;
}

export default function Revenue() {
  const [predictions, setPredictions] = useState<RevenuePrediction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [predictionAmount, setPredictionAmount] = useState('');
  const [confidence, setConfidence] = useState(0.75);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [predictionsData, campaignsData] = await Promise.all([
        supabase
          .from('revenue_predictions')
          .select('*, campaigns!inner(id, name, status, user_id)')
          .eq('campaigns.user_id', user.id)
          .order('prediction_date', { ascending: false }),
        supabase
          .from('campaigns')
          .select('id, name, status')
          .eq('user_id', user.id)
          .order('name'),
      ]);

      setPredictions(predictionsData.data || []);
      setCampaigns(campaignsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrediction = async () => {
    try {
      const amount = parseFloat(predictionAmount);
      if (isNaN(amount) || amount <= 0) return;

      const { error } = await supabase
        .from('revenue_predictions')
        .insert([{
          campaign_id: selectedCampaign,
          predicted_revenue: amount,
          confidence_score: confidence,
        }]);

      if (error) throw error;

      await loadData();
      setShowModal(false);
      setSelectedCampaign('');
      setPredictionAmount('');
      setConfidence(0.75);
    } catch (error) {
      console.error('Error creating prediction:', error);
    }
  };

  const totalPredicted = predictions.reduce(
    (sum, p) => sum + parseFloat(p.predicted_revenue.toString()),
    0
  );

  const totalActual = predictions.reduce(
    (sum, p) => sum + parseFloat(p.actual_revenue?.toString() || '0'),
    0
  );

  const avgConfidence = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + parseFloat(p.confidence_score.toString()), 0) / predictions.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Revenue Predictions</h1>
          <p className="text-gray-600">Track and predict campaign revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition transform hover:scale-105 shadow-md font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          <span>New Prediction</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Predicted</p>
          <p className="text-2xl font-bold text-gray-800">
            ${totalPredicted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Actual Revenue</p>
          <p className="text-2xl font-bold text-gray-800">
            ${totalActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-gray-800">
            {(avgConfidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No predictions yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start predicting revenue for your campaigns to track performance and optimize your strategy.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition transform hover:scale-105 shadow-md font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            <span>Create Your First Prediction</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Campaign</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Predicted</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actual</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Confidence</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction) => {
                const accuracy = prediction.actual_revenue
                  ? ((1 - Math.abs(parseFloat(prediction.predicted_revenue.toString()) - parseFloat(prediction.actual_revenue.toString())) / parseFloat(prediction.predicted_revenue.toString())) * 100)
                  : null;

                return (
                  <tr key={prediction.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">
                          {prediction.campaigns?.name || 'Unknown Campaign'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(prediction.prediction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      ${parseFloat(prediction.predicted_revenue.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {prediction.actual_revenue
                        ? `$${parseFloat(prediction.actual_revenue.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full"
                            style={{ width: `${parseFloat(prediction.confidence_score.toString()) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {(parseFloat(prediction.confidence_score.toString()) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {accuracy !== null ? (
                        <div className="flex items-center space-x-2">
                          {accuracy >= 80 ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className={`font-semibold ${accuracy >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {accuracy.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">New Prediction</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition appearance-none bg-white"
                  required
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Predicted Revenue ($)
                </label>
                <input
                  type="number"
                  value={predictionAmount}
                  onChange={(e) => setPredictionAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level: {(confidence * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCampaign('');
                  setPredictionAmount('');
                  setConfidence(0.75);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createPrediction}
                disabled={!selectedCampaign || !predictionAmount}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Prediction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
