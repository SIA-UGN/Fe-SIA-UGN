import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "text-white hover:opacity-90",
        primary: "text-white hover:opacity-90",
        secondary: "text-white hover:opacity-90", 
        warning: "text-white hover:opacity-90",
        success: "text-white hover:opacity-90",
        outline: "border-2 bg-transparent hover:opacity-90",
        ghost: "bg-transparent hover:opacity-90",
      },
      size: {
        default: "h-12 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size,
  asChild = false,
  style,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  // Custom styles for each variant
  const getCustomStyle = (variant) => {
    const baseStyle = { borderRadius: '12px' }
    const styles = {
      default: { ...baseStyle, backgroundColor: '#015023' },
      primary: { ...baseStyle, backgroundColor: '#015023' },
      secondary: { ...baseStyle, backgroundColor: '#DABC4E', color: '#ffffffff' },
      warning: { ...baseStyle, backgroundColor: '#BE0414' },
      success: { ...baseStyle, backgroundColor: '#16874B' },
      outline: { 
        ...baseStyle,
        borderColor: '#015023', 
        color: '#015023',
        backgroundColor: 'transparent'
      },
      ghost: { 
        ...baseStyle,
        backgroundColor: 'transparent', 
        color: '#015023' 
      }
    }
    return styles[variant] || styles.default
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      style={{ ...getCustomStyle(variant), ...style }}
      {...props} 
    />
  );
}

// Convenience components for easier usage
const PrimaryButton = React.forwardRef((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
))

const SecondaryButton = React.forwardRef((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
))

const WarningButton = React.forwardRef((props, ref) => (
  <Button ref={ref} variant="warning" {...props} />
))

const SuccessButton = React.forwardRef((props, ref) => (
  <Button ref={ref} variant="success" {...props} />
))

const OutlineButton = React.forwardRef((props, ref) => (
  <Button ref={ref} variant="outline" {...props} />
))

const GhostButton = React.forwardRef((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
))

PrimaryButton.displayName = "PrimaryButton"
SecondaryButton.displayName = "SecondaryButton"
WarningButton.displayName = "WarningButton"
SuccessButton.displayName = "SuccessButton"
OutlineButton.displayName = "OutlineButton"
GhostButton.displayName = "GhostButton"

export { 
  Button, 
  buttonVariants,
  PrimaryButton,
  SecondaryButton,
  WarningButton,
  SuccessButton,
  OutlineButton,
  GhostButton
}
