import React, { useEffect } from "react";

type ModalProps = {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  nested?: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  disableEscClose?: boolean; 
};

const sizeMap: Record<ModalProps["size"], string> = {
  xs: "w-[350px]",
  sm: "w-[500px]",
  md: "w-[650px]",
  lg: "w-[800px]",
  xl: "w-[950px]",
  xxl: "w-[1100px]",
  xxxl: "w-[1350px]",
};

export default function RequestModal({
  size,
  nested = false,
  onClose,
  title,
  children,
  disableEscClose,
}: ModalProps) {

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
      className={`fixed inset-0 z-50 flex items-center justify-center 
      ${nested ? "bg-[#2a272785]" : "bg-[#11060685]"}`}
    >
      <div
        className={`bg-white rounded-xl shadow-lg relative flex flex-col 
        max-h-[90vh] ${sizeMap[size]}`}
      >
        {(onClose || title) && (
          <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-gray-700">
                {title}
              </h2>
            )}

            {onClose && (
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

        {/* SCROLLABLE CONTENT */}
        <div className="text-sm text-gray-700 px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
