import * as React from "react";
import { cn } from "@/lib/utils";

type InputSize = "sm" | "md" | "lg";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  inputSize?: InputSize;
};

const sizes: Record<InputSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-4 text-base",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = "md", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          sizes[inputSize],
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
