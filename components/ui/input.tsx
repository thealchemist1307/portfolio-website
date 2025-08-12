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
          "w-full rounded-sm border-2 border-foreground bg-background text-foreground placeholder:text-foreground/60 focus-visible:outline-none",
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
