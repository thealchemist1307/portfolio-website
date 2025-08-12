"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Larger track for better visibility and tap area
        "relative inline-flex h-[30px] w-[56px] shrink-0 items-center overflow-hidden rounded-full border border-[var(--border)] bg-foreground/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)] data-[state=checked]:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 shadow-[inset_0_0_0_1px_var(--border)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Larger thumb, moves from 3px -> 29px
          "pointer-events-none block h-[24px] w-[24px] translate-x-[3px] transform rounded-full bg-background transition-[transform,background-color] duration-200 ease-in-out will-change-transform data-[state=checked]:translate-x-[29px] data-[state=checked]:bg-[var(--accent-foreground)] dark:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
