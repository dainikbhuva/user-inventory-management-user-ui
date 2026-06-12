import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Building2,
  Receipt,
  Boxes,
  Layers,
  ListTree,
  Globe,
  Map,
  MapPin,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inventory: Package,
  orders: ClipboardList,
  users: Users,
  companies: Building2,
  subscriptions: Receipt,
  modules: Boxes,
  'module-groups': Layers,
  'module-items': ListTree,
  countries: Globe,
  states: Map,
  cities: MapPin,
  plans: CreditCard,
};

export const getModuleIcon = (code: string): LucideIcon => {
  return ICON_MAP[code] ?? Boxes;
};
