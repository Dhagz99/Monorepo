"use client";

import { useAuth } from "@/components/context/UserContext";
import Sidebar from "@/components/layouts/Sidebar";
import SweetAlert from "@/components/Swal";

import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Settings,
  User,
  User2,
} from "lucide-react";

import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CICLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(true);

  const [openMenu, setOpenMenu] = useState(false);

  const [openBranchModal, setOpenBranchModal] =
    useState(false);

  const [openSettings, setOpenSettings] =
    useState(false);

  const [userModal, setUserModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { user, loading, logout, hasPermission } =
    useAuth();

  // CLOSE USER MENU ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside
        className={`
          sticky top-0 h-screen
          bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${openSidebar ? "w-72" : "w-20"}
          overflow-hidden shrink-0
          shadow-sm
        `}
      >
        <Sidebar
          isOpen={openSidebar}
          onToggle={() =>
            setOpenSidebar((prev) => !prev)
          }
        />
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
        {/* LEFT */}
        <div className="flex flex-col">
          {/* BREADCRUMB */}
          <p className="text-xs text-slate-400">
            CIC / Dashboard
          </p>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* NOTIFICATION */}
          <button
            className="
              relative
              w-10 h-10 rounded-xl
              bg-slate-100 hover:bg-slate-200
              transition
              flex items-center justify-center
            "
          >
            <Bell
              size={18}
              className="text-slate-700"
            />

            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* USER MENU */}
          <div
            ref={menuRef}
            className="relative"
          >
            <button
              onClick={() =>
                setOpenMenu((prev) => !prev)
              }
              className="
                flex items-center gap-3
                px-3 py-2 rounded-2xl
                hover:bg-slate-100
                transition-all
              "
            >
              {/* AVATAR */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User2
                  className="text-blue-600"
                  size={18}
                />
              </div>

              {/* USER INFO */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-800">
                  {user.username}
                </span>

                <span className="text-xs text-slate-500">
                  Administrator
                </span>
              </div>

              <ChevronDown
                size={18}
                className={`
                  text-slate-500 transition-transform
                  ${openMenu ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* DROPDOWN */}
            {openMenu && (
              <div
                className="
                  absolute right-0 top-14
                  w-64 bg-white
                  border border-slate-200
                  rounded-3xl shadow-xl
                  overflow-hidden
                "
              >
                {/* PROFILE */}
                <div className="px-5 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <User2
                        className="text-blue-600"
                        size={24}
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-800">
                        {user.username}
                      </h2>

                      <p className="text-sm text-slate-500">
                        System Administrator
                      </p>
                    </div>
                  </div>
                </div>

                {/* MENU ITEMS */}
                <div className="p-2">
                  {/* SETTINGS */}
                  <button
                    onClick={() =>
                      setOpenSettings(true)
                    }
                    className="
                      w-full flex items-center gap-3
                      px-4 py-3 rounded-2xl
                      hover:bg-slate-100
                      transition text-slate-700
                    "
                  >
                    <Settings size={18} />

                    <span className="text-sm font-medium">
                      Settings
                    </span>
                  </button>

                  {/* USERS */}
                  {hasPermission(
                    "USER_MANAGE"
                  ) && (
                    <button
                      onClick={() =>
                        setUserModal(true)
                      }
                      className="
                        w-full flex items-center gap-3
                        px-4 py-3 rounded-2xl
                        hover:bg-slate-100
                        transition text-slate-700
                      "
                    >
                      <User size={18} />

                      <span className="text-sm font-medium">
                        Users
                      </span>
                    </button>
                  )}

                  {/* BRANCHES */}
                  <button
                    onClick={() =>
                      setOpenBranchModal(true)
                    }
                    className="
                      w-full flex items-center gap-3
                      px-4 py-3 rounded-2xl
                      hover:bg-slate-100
                      transition text-slate-700
                    "
                  >
                    <Home size={18} />

                    <span className="text-sm font-medium">
                      Branches
                    </span>
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={() => {
                      SweetAlert.confirmationAlert(
                        "Sign out",
                        "Are you sure you want to sign out?",
                        async () => {
                          SweetAlert.loadingAlert(
                            "Signing out..."
                          );

                          await logout();

                          window.location.href =
                            "/login";
                        }
                      );
                    }}
                    className="
                      w-full flex items-center gap-3
                      px-4 py-3 rounded-2xl
                      hover:bg-red-50
                      transition text-red-600
                    "
                  >
                    <LogOut size={18} />

                    <span className="text-sm font-medium">
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}