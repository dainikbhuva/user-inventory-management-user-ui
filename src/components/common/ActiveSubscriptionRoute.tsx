import { ProtectedRoute } from './ProtectedRoute';
import { SubscriptionRoute } from './SubscriptionRoute';

interface ActiveSubscriptionRouteProps {
  children: React.ReactNode;
}

/** Requires login and an active (non-expired) subscription. */
export const ActiveSubscriptionRoute: React.FC<ActiveSubscriptionRouteProps> = ({ children }) => (
  <ProtectedRoute>
    <SubscriptionRoute>{children}</SubscriptionRoute>
  </ProtectedRoute>
);
