/**
 * PactFlow — UI Component Library Index
 * Single import point for all 18 reusable UI primitives
 *
 * Requirements: Reusable, Accessible, Responsive, Dark Mode first.
 * Usage: import { Button, Input, Select, Checkbox, Card, Modal } from "@/components/ui";
 */

// 1. Button
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

// 2. Input
export { Input, inputVariants } from "./input";
export type { InputProps } from "./input";

// 3. TextArea
export { TextArea, textareaVariants } from "./textarea";
export type { TextAreaProps } from "./textarea";

// 4. Select
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";

// 5. Checkbox
export { Checkbox } from "./checkbox";
export type { CheckboxProps } from "./checkbox";

// 6. Switch
export { Switch } from "./switch";
export type { SwitchProps } from "./switch";

// 7. Card
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

// 8. Badge
export { Badge, badgeVariants } from "./badge";
export type { BadgeProps } from "./badge";

// 9. Avatar
export { Avatar, avatarVariants } from "./avatar";
export type { AvatarProps } from "./avatar";

// 10. Tooltip
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  SimpleTooltip,
} from "./tooltip";
export type { SimpleTooltipProps } from "./tooltip";

// 11. Modal
export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
  SimpleModal,
} from "./modal";
export type { SimpleModalProps } from "./modal";

// 12. Dialog
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

// 13. Toast
export { Toaster, ToastCard, toast } from "./toast";
export type { ToastCardProps } from "./toast";

// 14. Spinner
export { Spinner, spinnerVariants } from "./spinner";
export type { SpinnerProps } from "./spinner";

// 15. Skeleton
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

// 16. Divider
export { Divider, Separator } from "./divider";
export type { DividerProps } from "./divider";

// 17. Empty State
export { EmptyState } from "./empty-state";

// 18. Error State
export { ErrorState, errorStateVariants } from "./error-state";
export type { ErrorStateProps } from "./error-state";

// Typography helpers
export {
  Heading,
  Text,
  Code,
  Label,
  MilestoneStatusBadge,
  ProjectStatusBadge,
  headingVariants,
  textVariants,
} from "./typography";

// Breadcrumb helper
export { Breadcrumb } from "./breadcrumb";
export type { BreadcrumbItem } from "./breadcrumb";
