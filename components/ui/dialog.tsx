"use client";

import * as React from "react";

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

export function Dialog({ open: controlledOpen, defaultOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(!!defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? !!controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogOverlay(props: React.ComponentProps<'div'>) {
  const ctx = React.useContext(DialogContext);
  if (!ctx?.open) return null;
  return (
    <div
      {...props}
      role="presentation"
      onClick={(e) => {
        props.onClick?.(e);
        // clicking overlay closes
        ctx.setOpen(false);
      }}
      className={(props.className ?? "") + " fixed inset-0 z-[100] bg-black/50"}
    />
  );
}

export function DialogContent({ className, children, ...rest }: React.ComponentProps<'div'>) {
  const ctx = React.useContext(DialogContext);
  if (!ctx?.open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      {...rest}
      className={(className ?? "") + " fixed z-[101] inset-0 flex items-center justify-center p-4"}
      onClick={(e) => {
        // prevent overlay-close when clicking inside content
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...rest }: React.ComponentProps<'div'>) {
  return <div {...rest} className={(className ?? "") + " mb-3"} />;
}

export function DialogTitle({ className, ...rest }: React.ComponentProps<'h2'>) {
  return <h2 {...rest} className={(className ?? "") + " text-base font-bold"} />;
}

export function DialogDescription({ className, ...rest }: React.ComponentProps<'p'>) {
  return <p {...rest} className={(className ?? "") + " text-sm text-foreground/70"} />;
}

export function DialogClose({ className, children, ...rest }: React.ComponentProps<'button'>) {
  const ctx = React.useContext(DialogContext);
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => { rest.onClick?.(e); ctx?.setOpen(false); }}
      className={"inline-flex items-center gap-2 rounded-sm " + (className ?? "")}
    >
      {children ?? <span>Close</span>}
    </button>
  );
}
