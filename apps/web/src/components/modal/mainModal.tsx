import React, { useEffect } from "react";
import {ModalProps} from "@repo/shared";

const sizeMap: Record<ModalProps["size"], string> = {
  xs: "w-[350px]",
  sm: "w-[500px]",
  md: "w-[650px]",
  lg: "w-[800px]",
  xl: "w-[950px]",
  xxl: "w-[1100px]",
  xxxl: "w-[1350px]",
};

export default function MainModal({
  size,
  nested = false,
  onClose,
  title,
  children,
  disableEscClose,
  showCloseButton = true,
}: ModalProps) {

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  
  useEffect(() => {
    if (disableEscClose) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, disableEscClose]);

  return (
    <div
      onClick={() => onClose?.()}
      className={`fixed inset-0 z-999 flex items-center justify-center 
      ${nested ? "bg-[#2a272785]" : "bg-[#11060685]"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-xl shadow-lg relative flex flex-col mx-custom-24 md:mx-0 
        max-h-[90vh] ${sizeMap[size]}`}
      >
        {(title) && (
          <div className="flex justify-between items-center px-6 ">
            {title && (
              <h2 className="text-xl font-semibold text-gray-700">
                {title}
              </h2>
            )}

            {onClose && showCloseButton && (
              <button
                onClick={onClose}
                className="text-3xl font-bold rounded-full w-10 h-10 
                hover:bg-gray-300 text-gray-600 cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {onClose && showCloseButton && (
              <div className="absolute right-custom-16 top-1.5">
                <button
                  onClick={onClose}
                  className="text-3xl font-bold rounded-full w-10 h-10
                  hover:bg-gray-300 text-gray-600 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

        {/* SCROLLABLE CONTENT */}
        <div className="text-sm text-gray-700 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
