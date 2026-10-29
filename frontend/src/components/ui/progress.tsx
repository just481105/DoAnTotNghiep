"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const safeValue = Math.min(Math.max(value || 0, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-slate-900 dark:bg-slate-50 transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - safeValue}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };