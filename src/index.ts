// Styles
import './styles/variables.css';

// Types
export type {
  NavItem,
  NavItemType,
  NavLinkItem,
  NavGroupItem,
  NavSectionHeader,
  NavDividerItem,
  ActiveMatchStrategy,
  ActiveMatcher,
  NavCSSVariable,
  NavCallbacks,
  SidebarVariant,
  NavAnimationConfig,
  NavGroupProps as NavGroupPropsType,
  SidebarProps as SidebarPropsType,
  NavBarProps,
  NavLayoutProps,
  Workspace,
  UserInfo,
  NavConfig,
  NavColorConfig,
} from './types';

// Components
export { NavGroup } from './components/NavGroup';
export type { NavGroupProps } from './components/NavGroup';
export { NavProvider, NavContext } from './components/NavProvider';
export type { NavProviderProps, NavAPI } from './components/NavProvider';
export { Sidebar } from './components/Sidebar';
export type { SidebarProps, SidebarRef } from './components/Sidebar';
export { NavSection } from './components/NavSection';
export type { NavSectionProps } from './components/NavSection';

// Hooks
export {
  useNav,
  useNavItems,
  useActiveNavItem,
  useCurrentPath,
  useNavAnimation,
  useNavVars,
  useNavKeyboard,
  useNavColorScheme,
} from './hooks';
export type {
  UseNavItemsReturn,
  UseActiveNavItemOptions,
  UseActiveNavItemReturn,
  UseNavAnimationReturn,
  UseNavVarsReturn,
  UseNavKeyboardOptions,
  UseNavKeyboardReturn,
  UseNavColorSchemeReturn,
} from './hooks';
