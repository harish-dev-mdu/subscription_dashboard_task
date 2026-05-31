import { useEffect, useState } from 'react';
import { Check, Sparkles, Zap, Building, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPlans } from '../store/slices/planSlice';
import { fetchMySubscription } from '../store/slices/subscriptionSlice';
import { createSubscriptionOrder, verifyPayment } from '../store/slices/subscriptionSlice';
import toast from 'react-hot-toast';
import { Plan } from '../types/subscription';
import api from '../lib/axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Plans = () => {
  const dispatch = useAppDispatch();
  const { plans, isLoading: plansLoading } = useAppSelector((state) => state.plans);
  const { currentSubscription } = useAppSelector((state) => state.subscription);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPlans() as any);
    if (isAuthenticated) {
      dispatch(fetchMySubscription() as any);
    }
  }, [dispatch, isAuthenticated]);

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('starter')) return Sparkles;
    if (planName.toLowerCase().includes('professional')) return Zap;
    if (planName.toLowerCase().includes('business')) return Building;
    if (planName.toLowerCase().includes('enterprise')) return Crown;
    return Sparkles;
  };

  const getPlanGradient = (index: number) => {
    const gradients = [
      'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
      'from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30',
      'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
      'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30',
    ];
    return gradients[index % gradients.length];
  };

  const currentPlanPrice = currentSubscription?.planId && typeof currentSubscription.planId === 'object'
    ? (currentSubscription.planId as Plan).price
    : 0;

  const getButtonConfig = (plan: Plan, isActive: boolean) => {
    if (isActive) {
      return { label: 'Current Plan', disabled: true, style: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed', icon: null };
    }
    if (currentSubscription?.status === 'active') {
      if (plan.price > currentPlanPrice) {
        return { label: 'Upgrade', disabled: false, style: 'bg-green-600 hover:bg-green-700 text-white', icon: ArrowUp };
      } else {
        return { label: 'Downgrade', disabled: false, style: 'bg-orange-500 hover:bg-orange-600 text-white', icon: ArrowDown };
      }
    }
    return {
      label: 'Get Started',
      disabled: false,
      style: plan.name.toLowerCase().includes('professional') ? 'btn-primary' : 'btn-secondary',
      icon: null
    };
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }
    setSelectedPlan(plan);
    setIsProcessing(true);
    setProcessingPlanId(plan._id);
    try {
      const result = await dispatch(createSubscriptionOrder(plan._id) as any).unwrap();
      await dispatch(
        verifyPayment({
          orderId: result.orderId,
          paymentId: `pay_${Date.now()}`,
          signature: 'dummy',
        }) as any
      ).unwrap();
      toast.success('Subscription activated successfully!');
      dispatch(fetchMySubscription() as any);
    } catch (error: any) {
      toast.error(error || 'Failed to create subscription');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
      setProcessingPlanId(null);
    }
  };

  const handleUpgradeDowngrade = async (plan: Plan) => {
    const isUpgrade = plan.price > currentPlanPrice;
    const action = isUpgrade ? 'upgrade' : 'downgrade';
    if (!confirm(`Are you sure you want to ${action} to ${plan.name}?\n\nYour current subscription will be cancelled and a new one will start immediately.`)) {
      return;
    }
    setIsProcessing(true);
    setProcessingPlanId(plan._id);
    try {
      const response = await api.post(`/subscriptions/upgrade/${plan._id}`);
      toast.success(response.data.message || `Successfully ${action}d to ${plan.name}!`);
      dispatch(fetchMySubscription() as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} subscription`);
    } finally {
      setIsProcessing(false);
      setProcessingPlanId(null);
    }
  };

  const handleButtonClick = (plan: Plan, isActive: boolean) => {
    if (isActive) return;
    if (currentSubscription?.status === 'active') {
      handleUpgradeDowngrade(plan);
    } else {
      handleSubscribe(plan);
    }
  };

  if (plansLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-10 w-64 skeleton mx-auto mb-2"></div>
          <div className="h-5 w-96 skeleton mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-6 w-32 skeleton mb-4"></div>
              <div className="h-10 w-24 skeleton mb-6"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 skeleton"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. No hidden fees, no surprises.
        </p>
      </div>

      {currentSubscription?.status === 'active' && (
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-green-800 dark:text-green-300 text-center">
            You have an active{' '}
            <strong>
              {typeof currentSubscription.planId === 'object'
                ? (currentSubscription.planId as Plan).name
                : 'subscription'}
            </strong>
            . Expires on {new Date(currentSubscription.endDate).toLocaleDateString()}.{' '}
            <span className="text-sm opacity-75">You can upgrade or downgrade anytime.</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const Icon = getPlanIcon(plan.name);
          const isPopular = plan.name.toLowerCase().includes('professional');
          const isActive = currentSubscription?.planId && typeof currentSubscription.planId === 'object'
            ? (currentSubscription.planId as Plan)._id === plan._id
            : false;

          const btnConfig = getButtonConfig(plan, isActive);
          const BtnIcon = btnConfig.icon;
          const isThisProcessing = processingPlanId === plan._id;

          return (
            <div
              key={plan._id}
              className={`relative card-hover overflow-hidden ${
                isPopular ? 'ring-2 ring-primary-600 dark:ring-primary-500' : ''
              } ${isActive ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}
            >
              {isPopular && !isActive && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              {isActive && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  CURRENT
                </div>
              )}

              <div className={`h-2 bg-gradient-to-r ${getPlanGradient(index)}`}></div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getPlanGradient(index)} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.formattedDuration}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">/{plan.duration} {plan.durationUnit}</span>
                  </div>
                  {currentSubscription?.status === 'active' && !isActive && (
                    <p className={`text-xs mt-1 font-medium ${plan.price > currentPlanPrice ? 'text-green-600' : 'text-orange-500'}`}>
                      {plan.price > currentPlanPrice
                        ? `+₹${plan.price - currentPlanPrice} more`
                        : `-₹${currentPlanPrice - plan.price} less`}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleButtonClick(plan, isActive)}
                  disabled={isProcessing || btnConfig.disabled}
                  className={`w-full btn-lg flex items-center justify-center gap-2 ${btnConfig.style}`}
                >
                  {isThisProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {BtnIcon && <BtnIcon className="w-4 h-4" />}
                      {btnConfig.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">All plans include a 14-day free trial. No credit card required.</p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure Payments</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Your payment information is always safe and secure with us.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy Refunds</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Not satisfied? Get a full refund within 30 days.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Our support team is here to help you anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default Plans;