"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-lg border-2 transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "border-[#015023] bg-white shadow-sm",
        "hover:border-[#16874B] hover:shadow-md",
        "focus-visible:ring-2 focus-visible:ring-[#015023] focus-visible:ring-offset-2",
        "data-[state=checked]:bg-[#015023] data-[state=checked]:border-[#015023]",
        "data-[state=checked]:text-white",
        "aria-invalid:border-[#BE0414] aria-invalid:ring-[#BE0414]/20",
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-all">
        <CheckIcon className="size-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox }
