"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full border-2", className)}
      style={{
        borderColor: '#015023',
        fontFamily: 'Urbanist, sans-serif'
      }}
      {...props} />
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full text-sm font-bold",
        className
      )}
      style={{
        backgroundColor: '#DABC4E',
        color: '#FFFFFF',
        fontFamily: 'Urbanist, sans-serif'
      }}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }
