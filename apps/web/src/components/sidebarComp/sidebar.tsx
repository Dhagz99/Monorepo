"use client"

import {
  MenuIcon,
  XIcon,
  ChevronDown,
  Cpu,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MENU_SECTIONS } from "./menu.config"
import { useRef, useState, useEffect } from "react"
import { MenuItem, MenuSection } from "@repo/shared"

const menuItemClass =
  "flex items-center text-sm gap-x-2 py-2 rounded-md w-full transition-colors cursor-pointer"

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [showArrow, setShowArrow] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const checkScroll = () => {
      const isScrollable = el.scrollHeight > el.clientHeight
      const isAtBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 5

      setShowArrow(isScrollable && !isAtBottom)
    }

    checkScroll()

    el.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)

    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  return (
    <div
      className={`
        relative
        h-full
        bg-neutralLight
        flex flex-col
        transition-all duration-300
        ${isOpen ? "p-4" : "py-4 px-2"}
      `}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className={`
          absolute
          top-0
          -right-10
          z-50
          flex
          items-center
          justify-center
          rounded-br-md
          w-10
          h-10
          bg-neutralLight
          border
          border-neutralLight
          text-mainLight
          cursor-pointer
          hover:bg-neutral-100
          transition-all
          duration-200
          text-neutralPrimary
        `}
      >
        {isOpen ? (
          <ChevronLeft className="w-custom-24 h-custom-24" />
        ) : (
          <ChevronRight className="w-custom-24 h-custom-24" />
        )}
      </button>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutralPrimary pb-3.5 mb-6">
        <button
        onClick={() => {
            router.push("/?initialize=true")
        }}
        className={`
            inline-flex items-center
            ${isOpen ? "justify-between" : "justify-center"}
            w-full
            bg-positive hover:bg-positive-hover
            py-2 rounded-lg text-white px-4
            transition-all duration-300
        `}
        >
        {isOpen ? (
            <>
            Initialize Clients <Cpu />
            </>
        ) : (
            <Cpu />
        )}
        </button>
      </div>

      {/* Menu */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col gap-y-4 w-full overflow-y-auto"
      >
        {MENU_SECTIONS.map((section: MenuSection) => {
          const visibleItems = section.items

          return (
            <div key={section.title} className="w-full">
              {isOpen && (
                <h6 className="text-sm text-mainNeutral mb-2">
                  {section.title}
                </h6>
              )}

              <ul className="flex flex-col gap-y-3 w-full font-semibold">
                {visibleItems.map((item: MenuItem) => {
                  const { label, icon: Icon, path, children } = item
                  const isExpandable = children && children.length > 0
                  const isExpanded = expanded[label]
                  const isActive = Boolean(
                    path &&
                    (
                      pathname === path ||
                      pathname.startsWith(path + "/")
                    )
                  )

                  // =====================
                  // EXPANDABLE ITEM
                  // =====================
                  if (isExpandable && children) {
                    const isChildActive = children.some(
                      (child) =>
                        pathname === child.path ||
                        pathname.startsWith(child.path + "/")
                    )

                    return (
                      <li key={label}>
                        <button
                          onClick={() =>
                            setExpanded(prev => ({
                              ...prev,
                              [label]: !prev[label]
                            }))
                          }
                          className={`
                            ${menuItemClass}
                            ${isOpen ? "justify-between px-4" : "justify-center"}
                            ${isChildActive
                              ? "bg-mainPrimary text-white"
                              : "bg-neutralMed text-neutralPrimary hover:bg-mainPrimary hover:text-white"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            {isOpen && <span>{label}</span>}
                            {!isOpen && (
                              <Icon className="w-5" />
                            )}
                          </div>

                          {isOpen && (
                            <ChevronDown
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        {isExpanded && isOpen && (
                          <ul className="mt-2 flex flex-col gap-2 bg-white p-3 rounded-md shadow">
                            {children.map((child) => {
                              const ChildIcon = child.icon
                              const isChildActive = Boolean(
                                child.path &&
                                (
                                  pathname === child.path ||
                                  pathname.startsWith(child.path + "/")
                                )
                              )

                              return (
                                <li key={child.label}>
                                  <Link
                                    href={child.path!}
                                    className={`
                                      flex items-center justify-between px-3 py-2 rounded-md text-sm
                                      ${
                                        isChildActive
                                          ? "text-mainPrimary font-bold"
                                          : "text-neutralPrimary hover:text-mainPrimary"
                                      }
                                    `}
                                  >
                                    <span>{child.label}</span>
                                    <ChildIcon className="w-4" />
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </li>
                    )
                  }

                  // =====================
                  // NORMAL ITEM
                  // =====================
                  return (
                    <li key={label}>
                      <Link
                        href={path!}
                        className={`
                          ${menuItemClass}
                          ${isOpen ? "justify-between px-4" : "justify-center"}
                          ${
                            isActive
                              ? "bg-mainPrimary text-white"
                              : "bg-neutralMed text-neutralPrimary hover:bg-mainPrimary hover:text-white"
                          }
                        `}
                      >
                        {isOpen && <span>{label}</span>}
                        <Icon
                          className={`
                            w-5
                            ${isActive ? "text-white" : ""}
                          `}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Scroll indicator */}
      {showArrow && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center opacity-30">
          <ChevronDown className="animate-bounce w-5" />
        </div>
      )}
    </div>
  )
}