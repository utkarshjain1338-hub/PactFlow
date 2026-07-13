/**
 * PactFlow — UI Component Library Index
 * Single import point for all reusable UI components
 *
 * Usage: import { Button, Card, Dialog } from "@/components/ui";
 */

// Buttons
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

// Cards
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  cardVariants,
} from "./card";
export type { CardProps } from "./card";

// Dialog / Modal
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ConfirmDialog,
} from "./dialog";

// Typography
export {
  Heading,
  Text,
  Code,
  Label,
  Badge,
  MilestoneStatusBadge,
  ProjectStatusBadge,
  headingVariants,
  textVariants,
  badgeVariants,
} from "./typography";

// Breadcrumb
export { Breadcrumb } from "./breadcrumb";
export type { BreadcrumbItem } from "./breadcrumb";

// Empty State
export { EmptyState } from "./empty-state";

// Skeleton Loaders
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStat,
  SkeletonTableRow,
  SkeletonMilestoneList,
  SkeletonPageHeader,
  SkeletonDashboard,
} from "./skeleton";
