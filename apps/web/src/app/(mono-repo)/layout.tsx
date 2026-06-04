"use client";

import { useState } from "react";

import { redirect } from "next/navigation";
import { Home, LogOut, Settings, User, User2 } from "lucide-react";
import SweetAlert from "@/components/Swal";
import { useAuth } from "@/components/context/UserContext";
import RequestModal from "@/components/Modal";
import AccountConfigurationModal from "@/components/users/modal/AccountConfigurationModal";
import BranchList from "@/components/general/BranchList";
import SettingsModal from "@/components/settings/SettingsModal";



export default function PayrollLayout({children,}: {children: React.ReactNode;}) {
  const [OpenSidebar, setOpenSideBar] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const[openBranchModal, setOpenBranchModal] = useState(false)
  const [openSettings, setOpenSettings] = useState(false);
  const { user, loading, logout, hasPermission } = useAuth();

  const [userModal, setUserModal] = useState(false)

  if (loading) return null;
  if (!user) redirect("/login");




  return (
    <div className=" flex min-h-screen">
  


      <main className="flex-1 overflow-y-auto h-screen relative">


        <div className="sticky top-0 z-10 text-md flex items-center justify-end bg-mainNeutral px-8 py-2 shadow-[0px_0px_6px_4px_rgba(0,0,0,0.1)] min-h-14">
            <div onClick={() => setOpenMenu(prev => !prev)} className="inline-flex gap-x-2 cursor-pointer hover:scale-[1.03] transition duration-75">
              <User2 className="w-4"/>
              <h1>{user.username}</h1>
            </div>

            {openMenu &&(
              <ul className="absolute text-sm top-14 right-0 bg-mainLight w-50 h-auto rounded-bl-xl py-4 px-8 flex flex-col gap-y-4 items-start justify-end shadow-[0px_4px_6px_2px_rgba(0,0,0,0.1)] cursor-pointer">
                <li   onClick={() => setOpenSettings(true)} className="inline-flex gap-4 items-end justify-start w-full p-2 rounded-lg hover:bg-mainhighlight hover:text-mainLight">
                  <Settings/>
                  Settings
                </li>
           
                <li 
                  onClick={() => {
                    SweetAlert.confirmationAlert(
                      "Sign out",
                      "Are you sure you want to sign out?",
                      async () => {
                        SweetAlert.loadingAlert("Signing out...");

                        await logout();

                        window.location.href = "/login";
                      }
                    );
                  }}
                  className="inline-flex gap-4 items-end justify-start w-full p-2 rounded-lg hover:bg-mainhighlight hover:text-mainLight">
                  <LogOut/>
                  Sign Out
                </li>
            </ul>
            )}
            
        </div>

        <div className="flex flex-col bg-white w-full min-h-screen relative">
          {children}
        </div>

        

      </main>
      {userModal && (
          <RequestModal title=" Account Configuration" size="xxl" onClose={()=>setUserModal(false)}>
              <AccountConfigurationModal onClose={()=>setUserModal(false)} />
        </RequestModal>
      )}

      {openBranchModal && (
        <RequestModal title="Reorder Branches" size="lg" onClose={()=>setOpenBranchModal(false)}>
            <BranchList />
        </RequestModal>
      )}

      {openSettings && (
        <RequestModal
          title="System Settings"
          size="xxl"
          onClose={() => setOpenSettings(false)}
        >
          <SettingsModal />
        </RequestModal>
      )}
              

    </div>
  );
}
