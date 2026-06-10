import {
    Cog,
    UserPlus,
    BarChart3,
    FilePlus,
    User,

  } from "lucide-react"
import { MenuSection } from "@repo/shared"
  
export const MENU_SECTIONS: MenuSection[] = [

    {
      title: "General",
      items: [
        {
          label: "Client Operations",
          path: "/",
          icon: Cog
        },

        {
          label: "Agent Administration",
          icon: User,
          children: [
            {
              label: "Agent Master List",
              path: "/Agents",
              icon: UserPlus,

            },
            {
              label: "Agent Registration",
              path: "/Registration",
              icon: FilePlus,

            },
          
          ]
        },
        {
          label:"Reports & Analytics",
          path:"/Reports",
          icon: BarChart3,
         
        }
      ]
    },
   
    // {
    //   title: "Employees",
    //   items: [
    //     {
    //       label: "Employees List",
    //       path: "/employee-list",
    //       icon: User,
    //       permission: "EMPLOYEE_VIEW"
    //     },
     
    //   ]
    // },
   
  ]
  