import { MenuSection } from "@repo/shared"
import {
    LayoutDashboard,
    Calculator,
    Archive,
    Users,
    WalletCards
  } from "lucide-react"

  
export const MENU_SECTIONS: MenuSection[] = [

    {
      title: "Menu",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard
        },
        {
          label: "Borrowers",
          path: "/borrowers",
          icon: Users,
          permission:"ADMIN_MANAGE"
        },
        {
          label: "Loans",
          path: "/loans",
          icon: WalletCards,
          permission:"ADMIN_MANAGE"
        },
        // {
        //   label: "Payroll",
        //   icon: Calculator,
        //   children: [
        //     {
        //       label: "Run Payroll",
        //       path: "/main-payroll",
        //       icon: Calculator,
        //       permission:"ADMIN_MANAGE"
        //     },
        //     {
        //       label: "Payroll Archive",
        //       path: "/archive-payroll",
        //       icon: Archive,
        //       permission:"ADMIN_MANAGE"
        //     },
          
        //   ]
        // },
      ]
    },
   
  ]
  