export interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  durationUnit: 'days' | 'months' | 'years';
  features: string[];
  isActive: boolean;
  maxUsers: number;
  maxProjects: number;
  storageLimit: number;
  formattedPrice?: string;
  formattedDuration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: Plan | string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentId: string | null;
  orderId: string | null;
  paymentMethod: 'razorpay' | 'stripe' | 'manual' | null;
  amount: number;
  currency: string;
  autoRenew: boolean;
  cancelledAt: string | null;
  cancellationReason: string | null;
  isActive?: boolean;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionState {
  currentSubscription: Subscription | null;
  subscriptionHistory: Subscription[];
  isLoading: boolean;
  error: string | null;
}

export interface PlanState {
  plans: Plan[];
  selectedPlan: Plan | null;
  isLoading: boolean;
  error: string | null;
}
