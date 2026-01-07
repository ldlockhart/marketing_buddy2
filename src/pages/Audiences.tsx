import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Users,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

interface Audience {
  id: string;
  name: string;
  description: string | null;
  subscriber_count: number;
  created_at: string;
}

export default function Audiences() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAudience, setEditingAudience] = useState<Audience | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subscriber_count: 0,
  });

  useEffect(() => {
    loadAudiences();
  }, []);

  const loadAudiences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audiences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudiences(data || []);
    } catch (error) {
      console.error('Error loading audiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (audience?: Audience) => {
    if (audience) {
      setEditingAudience(audience);
      setFormData({
        name: audience.name,
        description: audience.description || '',
        subscriber_count: audience.subscriber_count,
      });
    } else {
      setEditingAudience(null);
      setFormData({ name: '', description: '', subscriber_count: 0 });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAudience(null);
    setFormData({ name: '', description: '', subscriber_count: 0 });
  };

  const saveAudience = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingAudience) {
        const { error } = await supabase
          .from('audiences')
          .update({
            name: formData.name,
            description: formData.description || null,
            subscriber_count: formData.subscriber_count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAudience.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('audiences')
          .insert([{
            user_id: user.id,
            name: formData.name,
            description: formData.description || null,
            subscriber_count: formData.subscriber_count,
            filters: {},
          }]);

        if (error) throw error;
      }

      await loadAudiences();
      closeModal();
    } catch (error) {
      console.error('Error saving audience:', error);
    }
  };

  const deleteAudience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audience?')) return;

    try {
      const { error } = await supabase
        .from('audiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAudiences(audiences.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting audience:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Audiences</h1>
          <p className="text-gray-600">Manage your subscriber segments</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition transform hover:scale-105 shadow-md font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>New Audience</span>
        </button>
      </div>

      {audiences.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No audiences yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create audience segments to target specific groups of subscribers with your campaigns.
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition transform hover:scale-105 shadow-md font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Audience</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience) => (
            <div
              key={audience.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(audience)}
                    className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAudience(audience.id)}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">{audience.name}</h3>
              {audience.description && (
                <p className="text-sm text-gray-600 mb-4">{audience.description}</p>
              )}

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Subscribers</p>
                <p className="text-2xl font-bold text-gray-800">
                  {audience.subscriber_count.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingAudience ? 'Edit Audience' : 'New Audience'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="e.g., Active Customers"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  placeholder="Describe this audience segment..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscriber Count
                </label>
                <input
                  type="number"
                  value={formData.subscriber_count}
                  onChange={(e) => setFormData({ ...formData, subscriber_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveAudience}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg hover:from-orange-500 hover:to-pink-500 transition font-semibold shadow-md"
              >
                {editingAudience ? 'Save Changes' : 'Create Audience'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
