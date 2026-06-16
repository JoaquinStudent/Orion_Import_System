"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-outline-variant group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-on-surface-variant",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
          error:
            "group-[.toaster]:!border-destructive/30 group-[.toaster]:!text-destructive",
          success: "group-[.toaster]:!border-whatsapp/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
