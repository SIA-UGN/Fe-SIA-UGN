"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { PrimaryButton, OutlineButton, WarningButton } from "@/components/ui/button"

const DialogContext = React.createContext({ open: undefined, onOpenChange: undefined })

function AlertDialog({ open, onOpenChange, modal = true, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function AlertDialogTrigger(props) {
  // Plain passthrough; consumers usually control `open` state externally
  return <button data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ children }) {
  if (typeof document === "undefined") return null
  return createPortal(children, document.body)
}

function AlertDialogOverlay({ className, ...props }) {
  const { open } = React.useContext(DialogContext)
  if (!open) return null
  return (
    <div
      data-slot="alert-dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/70", className)}
      {...props}
    />
  )
}

function AlertDialogContent({ className, onClickOutside, children, ...props }) {
  const { open } = React.useContext(DialogContext)
  if (!open) return null
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] sm:max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white gap-6 shadow-2xl duration-200 p-6",
          className
        )}
        style={{ borderRadius: 16 }}
        {...props}
      >
        {children}
      </div>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props} />
  );
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3", className)}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn("text-2xl font-bold", className)}
      style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn("text-base", className)}
      style={{ color: '#015023', opacity: 0.8, fontFamily: 'Urbanist, sans-serif' }}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}) {
  const { onOpenChange } = React.useContext(DialogContext)
  const { asChild, children, onClick, ...rest } = props
  const handleClick = (e) => {
    onClick?.(e)
    onOpenChange?.(false)
  }
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props?.onClick?.(e)
        handleClick(e)
      },
      className: cn(children.props?.className, className),
    })
  }
  return <PrimaryButton className={className} onClick={handleClick} {...rest} />
}

function AlertDialogCancel({
  className,
  ...props
}) {
  const { onOpenChange } = React.useContext(DialogContext)
  const { asChild, children, onClick, ...rest } = props
  const handleClick = (e) => {
    onClick?.(e)
    onOpenChange?.(false)
  }
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props?.onClick?.(e)
        handleClick(e)
      },
      className: cn(children.props?.className, className),
    })
  }
  return <OutlineButton className={className} onClick={handleClick} {...rest} />
}

function AlertConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Konfirmasikan"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Apakah Anda yakin ingin melanjutkan?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{cancelText || "Batal"}</OutlineButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <PrimaryButton onClick={onConfirm}>{confirmText || "Lanjutkan"}</PrimaryButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function AlertConfirmationRedDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Konfirmasikan"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Apakah Anda yakin ingin melanjutkan?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{cancelText || "Batal"}</OutlineButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <WarningButton onClick={onConfirm}>{confirmText || "Lanjutkan"}</WarningButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function AlertConfirmationDialogTwoOption({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  closeText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || "Konfirmasikan"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Apakah Anda yakin ingin melanjutkan?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{closeText || "Batal"}</OutlineButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <WarningButton onClick={onCancel}>{cancelText || "Lanjutkan"}</WarningButton>
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <PrimaryButton onClick={onConfirm}>{confirmText || "Lanjutkan"}</PrimaryButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AlertErrorDialog({
  open,
  onOpenChange,
  title,
  description,
  closeText,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle><span className='text-red-500'>{title || "Error"}</span></AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Terjadi kesalahan. Silakan coba lagi."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{closeText || "Tutup"}</OutlineButton>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AlertSuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  closeText,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle><span className='text-green-500'>{title || "Success"}</span></AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Operasi berhasil diselesaikan."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{closeText || "Tutup"}</OutlineButton>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AlertInfoDialog({
  open,
  onOpenChange,
  title,
  description,
  closeText,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle><span className='text-yellow-500'>{title || "Info"}</span></AlertDialogTitle>
          <AlertDialogDescription>
            {description || "Informasi penting untuk diketahui."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{closeText || "Tutup"}</OutlineButton>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function AlertWarningDialog({
  open,
  onOpenChange,
  title,
  description,
  closeText,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle><span className='text-yellow-500'>{title || "Info"}</span></AlertDialogTitle>
          <AlertDialogDescription>
            <span style={{ color: '#BE0414', fontWeight: '600' }}>
              {description || "Informasi penting untuk diketahui."}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton>{closeText || "Tutup"}</OutlineButton>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertConfirmationDialog,
  AlertConfirmationRedDialog,
  AlertErrorDialog,
  AlertSuccessDialog,
  AlertInfoDialog,
  AlertWarningDialog,
  AlertConfirmationDialogTwoOption,
}