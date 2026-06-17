import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '../../shared/subscription/SubscriptionContext';

interface SubscriptionRouteProps {
  children: React.ReactNode;
}

export const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ children }) => {
  const { subscription, isLoading } = useSubscription();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (subscription?.isExpired || subscription?.status === 'expired') {
    return <Navigate to="/plan-expired" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
