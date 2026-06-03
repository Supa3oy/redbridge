import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[#2a2a2a] bg-[#111] px-3 py-1 text-sm text-white shadow-sm transition-colors placeholder:text-[#4a4a4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d55] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
