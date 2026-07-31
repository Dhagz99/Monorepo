"use client";

import dynamic from "next/dynamic";
import "flatpickr/dist/flatpickr.min.css";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { DateRange } from "@repo/shared";

const Flatpickr = dynamic(
  () => import("react-flatpickr"),
  {
    ssr: false,
  }
);

const formatPHDate = (
  date: Date
): string => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

interface DateRangePickerProps {
  value?: Date[];
  onChange?: (range: DateRange) => void;

  disabledRanges?: {
    from: Date;
    to: Date;
  }[];

  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function DateRangePicker({
  value = [],
  onChange,
  placeholder = "Select date range",
  className = "",
  disabledRanges = [],
  disabled = false,
}: DateRangePickerProps) {
  const [range, setRange] =
    useState<Date[]>(value);

  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRange(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      <input
        type="text"
        readOnly
        disabled={disabled}
        value={
          range.length === 2
            ? `${formatPHDate(
                range[0]
              )} to ${formatPHDate(
                range[1]
              )}`
            : ""
        }
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        placeholder={placeholder}
        className={`
          w-full
          border
          border-neutralMed
          px-custom-16
          py-3
          rounded-lg
          outline-none
          transition-all
          ${
            disabled
              ? "bg-neutralLight cursor-not-allowed opacity-60"
              : "cursor-pointer bg-white focus:ring-1 focus:ring-mainPrimary focus:border-mainPrimary"
          }
        `}
      />

      {open && !disabled && (
        <div
          className="
            absolute
            left-0
            z-50
            mt-2
            bg-white
            shadow-lg
            border
            border-neutralMed
            rounded-lg
            overflow-hidden
          "
        >
          <Flatpickr
            value={range}
            onChange={(dates) => {
              setRange(dates);

              if (dates.length !== 2) {
                return;
              }

              const [
                startDate,
                endDate,
              ] = dates;

              onChange?.({
                startDate:
                  formatPHDate(startDate),
                endDate:
                  formatPHDate(endDate),
              });

              setOpen(false);
            }}
            options={{
              mode: "range",
              dateFormat: "Y-m-d",
              showMonths: 2,
              inline: true,
              disable: disabledRanges,
            }}
          />
        </div>
      )}
    </div>
  );
}