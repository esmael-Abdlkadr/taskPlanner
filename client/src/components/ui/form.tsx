import React from "react";
import { Controller, Control, FieldValues, FieldPath, ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from "react-hook-form";

// Basic Form container
export const Form = ({
  children,
  className = "",
  onSubmit,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  onSubmit: (e: React.FormEvent) => void;
} & React.FormHTMLAttributes<HTMLFormElement>) => {
  return (
    <form className={className} onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
};

// Form item container
export const FormItem = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

// Form label
export const FormLabel = ({
  children,
  htmlFor,
  className = "",
  required = false,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Form error message
export const FormError = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  if (!children) return null;
  return (
    <p className={`mt-1 text-sm text-red-600 dark:text-red-500 ${className}`}>
      {children}
    </p>
  );
};

// Form field - react-hook-form compatible version with proper TypeScript types
export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  render,
}: {
  name: TName;
  control: Control<TFieldValues>;
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
}) => {
  return <Controller name={name} control={control} render={render} />;
};

// Form control - simple wrapper
export const FormControl = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={className}>{children}</div>;
};

// Form message - for validation errors
export const FormMessage = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  if (!children) return null;
  return (
    <p className={`mt-1 text-sm text-red-600 dark:text-red-500 ${className}`}>
      {children}
    </p>
  );
};