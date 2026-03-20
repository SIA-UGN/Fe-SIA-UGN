"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-all duration-200",
        orientation === "vertical" &&
          "h-full w-2 border-l border-l-transparent hover:w-3",
        orientation === "horizontal" &&
          "h-2 flex-col border-t border-t-transparent hover:h-3",
        className
      )}
      style={{
        padding: '2px'
      }}
      {...props}>
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full transition-colors bg-[#015023]/30 hover:bg-[#015023]/50 dark:bg-white/20 dark:hover:bg-white/40"
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.5'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.3'
        }}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar }
