// Deprecated: subscriptions have been removed. Use PaidRoute instead.
import PaidRoute from "@/components/PaidRoute";
const SubscriptionRoute = ({ children }: { children: React.ReactNode }) => (
  <PaidRoute>{children}</PaidRoute>
);
export default SubscriptionRoute;
