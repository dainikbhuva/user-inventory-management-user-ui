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
  CalendarDays,
  CalendarCheck,
  Clock,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inventory: Package,
  orders: ClipboardList,
  users: Users,
  user: Users,
  companies: Building2,
  subscriptions: Receipt,
  modules: Boxes,
  'module-groups': Layers,
  'module-items': ListTree,
  countries: Globe,
  states: Map,
  cities: MapPin,
  plans: CreditCard,
  leave: CalendarDays,
  leaves: CalendarDays,
  'leave-types': CalendarCheck,
  attendance: Clock,
  announcements: Megaphone,
  announcement: Megaphone,
  master: Boxes,
};

export const getModuleIcon = (code: string): LucideIcon => {
  return ICON_MAP[code] ?? Boxes;
};
