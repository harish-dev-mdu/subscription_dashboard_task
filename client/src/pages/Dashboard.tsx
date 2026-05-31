import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPlans } from '../store/slices/planSlice';
import { fetchMySubscription } from '../store/slices/subscriptionSlice';
import { format, differenceInDays } from 'date-fns';
import { Plan } from '../types/subscription';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { plans } = useAppSelector((state) => state.plans);
  const { currentSubscription, subscriptionHistory, isLoading } = useAppSelector(
    (state) => state.subscription
  );

  useEffect(() => {
    dispatch(fetchPlans() as any);
    dispatch(fetchMySubscription() as any);
  }, [dispatch]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-100 dark:bg-green-900/30',
          badge: 'badge-success',
          label: 'Active',
        };
      case 'expired':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-100 dark:bg-red-900/30',
          badge: 'badge-danger',
          label: 'Expired',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          badge: 'badge-warning',
          label: 'Pending',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-800',
          badge: 'badge-secondary',
          label: 'Cancelled',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-800',
          badge: 'badge-secondary',
          label: status,
        };
    }
  };
  const handleCancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your subscription?')) return;
  try {
    await api.delete('/subscriptions/cancel');
    toast.success('Subscription cancelled successfully');
    dispatch(fetchMySubscription() as any);
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};

  const stats = [
    {
      name: 'Subscription Status',
      value: currentSubscription ? getStatusConfig(currentSubscription.status).label : 'No Plan',
      icon: CreditCard,
      change: currentSubscription?.status === 'active' ? 'Active subscription' : 'Subscribe now',
      changeType: currentSubscription?.status === 'active' ? 'positive' : 'neutral',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Days Remaining',
      value: currentSubscription?.daysRemaining?.toString() || '0',
      icon: Calendar,
      change: currentSubscription ? `${differenceInDays(new Date(currentSubscription.endDate), new Date())} days left` : 'N/A',
      changeType: 'neutral',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      name: 'Total Plans',
      value: plans.length.toString(),
      icon: TrendingUp,
      change: 'Available plans',
      changeType: 'neutral',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 skeleton rounded-xl"></div>
                <div className="h-8 w-16 skeleton"></div>
              </div>
              <div className="h-4 w-24 skeleton mb-2"></div>
              <div className="h-3 w-32 skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your subscription and account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{stat.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Subscription
            </h2>
          </div>
          <div className="p-6">
            {currentSubscription && currentSubscription.status === 'active' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {typeof currentSubscription.planId === 'object' ? (currentSubscription.planId as Plan).name : 'Subscription'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`badge ${getStatusConfig(currentSubscription.status).badge}`}
                      >
                        {getStatusConfig(currentSubscription.status).label}
                      </span>
                      {currentSubscription.isExpiringSoon && (
                        <span className="badge badge-warning">Expiring Soon</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{currentSubscription.amount}
                    </p>
                    {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                      {typeof currentSubscription.planId === 'object' ? (currentSubscription.planId as Plan).formattedDuration : ''}
                    </p> */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    {typeof currentSubscription.planId === 'object' ? 
  `${(currentSubscription.planId as Plan).duration} ${(currentSubscription.planId as Plan).durationUnit}` 
  : ''}
                    </p>
                  </div>
                </div>

                {/* <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800"> */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
  <button
    onClick={handleCancelSubscription}
    className="w-full btn-md bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
  >
    Cancel Subscription
  </button>
</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(currentSubscription.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(currentSubscription.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Days Remaining</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentSubscription.daysRemaining} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {currentSubscription.paymentMethod || 'N/A'}
                    </p>
                  </div>
                {/* </div> */}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <CreditCard className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Subscription
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You don't have an active subscription. Choose a plan to get started.
                </p>
                <Link
                  to="/plans"
                  className="btn-primary btn-md inline-flex items-center gap-2"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subscription History
            </h2>
          </div>
          <div className="p-6">
            {subscriptionHistory && subscriptionHistory.length > 0 ? (
              <div className="space-y-4">
                {subscriptionHistory.slice(0, 5).map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          getStatusConfig(sub.status).bg
                        }`}
                      >
                        {(() => {
                          const StatusIcon = getStatusConfig(sub.status).icon;
                          return (
                            <StatusIcon
                              className={`w-4 h-4 ${getStatusConfig(sub.status).color}`}
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {typeof sub.planId === 'object' ? (sub.planId as Plan).name : 'Plan'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(sub.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${getStatusConfig(sub.status).badge}`}>
                        {getStatusConfig(sub.status).label}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{sub.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No subscription history yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subscription Features
          </h2>
        </div>
        <div className="p-6">
          {currentSubscription && currentSubscription.planId && typeof currentSubscription.planId === 'object' && 'features' in currentSubscription.planId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentSubscription.planId as Plan).features?.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                Subscribe to a plan to view available features.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
