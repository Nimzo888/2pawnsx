import React from "react";
import { Dialog, DialogContent, DialogProps } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerProps } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useMediaQuery";

type ResponsiveDialogProps = DialogProps & {
  children: React.ReactNode;
  className?: string;
  drawerProps?: Omit<DrawerProps, "open" | "onOpenChange">;
};

/**
 * A responsive dialog component that renders as a drawer on mobile and a dialog on larger screens
 */
export function ResponsiveDialog({
  children,
  className,
  drawerProps,
  ...props
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={props.open}
        onOpenChange={props.onOpenChange}
        {...drawerProps}
      >
        <DrawerContent className={className}>{children}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog {...props}>
      <DialogContent className={className}>{children}</DialogContent>
    </Dialog>
  );
}
