/**
 * PactFlow — Application Layout Components Index
 * Single import point for all 10 layout components
 *
 * Requirements: Sidebar, Top Navigation, Breadcrumb, User Menu, Search Bar,
 * Notification Bell, Footer, Dashboard Layout, Mobile Navigation, Responsive Drawer.
 */

// 1. Sidebar
export { Sidebar } from "./sidebar";

// 2. Top Navigation
export { TopNav } from "./topnav";
export type { TopNavProps } from "./topnav";

// 3. Breadcrumb Navigation
export { BreadcrumbNav } from "./breadcrumb-nav";
export type { BreadcrumbNavProps } from "./breadcrumb-nav";

// 4. User Menu
export { UserMenu } from "./user-menu";

// 5. Search Bar & Command Palette
export { SearchBar } from "./search-bar";

// 6. Notification Bell & Panel
export { NotificationBell } from "./notification-bell";

// 7. Footer
export { Footer } from "./footer";

// 8. Dashboard Layout & Shell
export { DashboardShell, PageHeader, Section } from "./dashboard-shell";
export type { DashboardShellProps, PageHeaderProps, SectionProps } from "./dashboard-shell";

// 9. Mobile Navigation Bar
export { MobileNav } from "./mobile-nav";

// 10. Responsive Slide-out Drawer
export { ResponsiveDrawer } from "./responsive-drawer";
export type { ResponsiveDrawerProps } from "./responsive-drawer";
