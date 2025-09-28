import React from "react";
import "./ReusableButton.css";

type ReusableButtonProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  variant?: 'primary' | 'secondary' | 'small' | 'extra-small';
  [key: string]: any;
};

export function ReusableButton({
  children,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = "",
  variant = 'primary',
}: ReusableButtonProps) {
  const baseClass = "reusable-button";
  const variantClass = `reusable-button--${variant}`;
  const widthClass = fullWidth ? "reusable-button--full-width" : "";
  const disabledClass = (disabled || isLoading) ? "reusable-button--disabled" : "";
  const loadingClass = isLoading ? "reusable-button--loading" : "";

  const combinedClassName = [
    baseClass,
    variantClass,
    widthClass,
    disabledClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClassName}
    >
      {isLoading ? (
        <>
          <span className="reusable-button__spinner"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
