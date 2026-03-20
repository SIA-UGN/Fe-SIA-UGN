import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

function Pagination({
  className,
  ...props
}) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      style={{ fontFamily: 'Urbanist, sans-serif' }}
      {...props} />
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-2", className)}
      {...props} />
  );
}

function PaginationItem({
  ...props
}) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed";
  const activeStyles = isActive 
    ? "text-white" 
    : "text-gray-700 hover:bg-gray-100";
  const sizeStyles = size === "icon" ? "w-9 h-9" : "px-4 py-2";
  
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(baseStyles, activeStyles, sizeStyles, className)}
      style={isActive ? { 
        backgroundColor: '#015023',
        borderRadius: '12px',
        fontFamily: 'Urbanist, sans-serif'
      } : {
        borderRadius: '12px',
        fontFamily: 'Urbanist, sans-serif'
      }}
      {...props} />
  );
}

function PaginationPrevious({
  className,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-3", className)}
      {...props}>
      <ChevronLeftIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-3", className)}
      {...props}>
      <span className="hidden sm:inline">Next</span>
      <ChevronRightIcon className="w-4 h-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex w-9 h-9 items-center justify-center text-gray-500", className)}
      style={{ fontFamily: 'Urbanist, sans-serif' }}
      {...props}>
      <MoreHorizontalIcon className="w-4 h-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
