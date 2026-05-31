import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  durationUnit: string;
  features: string[];
  maxUsers: number;
  maxProjects: number;
  storageLimit: number;
  isActive: boolean;
}

const emptyPlan = {
  name: '',
  price: 0,
  currency: 'INR',
  duration: 30,
  durationUnit: 'days',
  features: [''],
  maxUsers: 1,
  maxProjects: 1,
  storageLimit: 100,
};

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState(emptyPlan);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/plans');
      setPlans(response.data.data.plans);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(emptyPlan);
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      features: plan.features.length > 0 ? plan.features : [''],
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      storageLimit: plan.storageLimit,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Please fill all required fields');
      return;
    }

    const cleanedFeatures = formData.features.filter((f) => f.trim() !== '');

    setIsSaving(true);
    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, { ...formData, features: cleanedFeatures });
        toast.success('Plan updated successfully');
      } else {
        await api.post('/plans', { ...formData, features: cleanedFeatures });
        toast.success('Plan created successfully');
      }
      setShowModal(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (plan: Plan) => {
    if (!confirm(`"${plan.name}" plan-ஐ deactivate பண்ணவா?`)) return;
    try {
      await api.delete(`/plans/${plan._id}`);
      toast.success('Plan deactivated successfully');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to deactivate plan');
    }
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });

  const updateFeature = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updated.length > 0 ? updated : [''] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plans Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, edit and manage subscription plans</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary btn-md inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Plan
        </button>
      </div>

      {/* Plans Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 skeleton rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No plans found</p>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{plan.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">₹{plan.price}</p>
                      <p className="text-xs text-gray-500">{plan.currency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{plan.duration} {plan.durationUnit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{plan.features.length} features</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(plan)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="label">Plan Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Starter Plan"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="499"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input w-full"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="30"
                    min="1"
                  />
                </div>
                <div>
                  <label className="label">Duration Unit</label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                    className="input w-full"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Max Users</label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                    className="input w-full"
                    min="-1"
                  />
                </div>
                <div>
                  <label className="label">Max Projects</label>
                  <input
                    type="number"
                    value={formData.maxProjects}
                    onChange={(e) => setFormData({ ...formData, maxProjects: Number(e.target.value) })}
                    className="input w-full"
                    min="-1"
                  />
                </div>
                <div>
                  <label className="label">Storage (MB)</label>
                  <input
                    type="number"
                    value={formData.storageLimit}
                    onChange={(e) => setFormData({ ...formData, storageLimit: Number(e.target.value) })}
                    className="input w-full"
                    min="-1"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Features</label>
                  <button onClick={addFeature} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="input flex-1"
                        placeholder={`Feature ${index + 1}`}
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary btn-md inline-flex items-center gap-2 flex-1 justify-center"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary btn-md">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;