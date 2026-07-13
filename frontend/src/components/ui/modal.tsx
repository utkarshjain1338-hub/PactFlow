"use client";

/**
 * PactFlow — Constellation of Trust UI Primitives
 * Reusable Modal Component (Wrapped Dialog primitive specifically for Modal workflows)
 *
 * Requirements: Reusable, Accessible (WCAG 2.1 AA focus trap + aria), Responsive, Dark Mode first.
 */
import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

const Modal = Dialog;
const ModalTrigger = DialogTrigger;
const ModalContent = DialogContent;
const ModalHeader = DialogHeader;
const ModalFooter = DialogFooter;
const ModalTitle = DialogTitle;
const ModalDescription = DialogDescription;
const ModalClose = DialogClose;

/**
 * High-level convenience Modal component for quick dialog presentation without boilerplate.
 */
export interface SimpleModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

function SimpleModal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = "md",
}: SimpleModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent size={size}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <div className="my-4">{children}</div>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}

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
};
