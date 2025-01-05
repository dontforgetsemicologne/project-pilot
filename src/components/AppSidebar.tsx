import * as React from "react"

import { auth } from "@/server/auth";
import { data } from '@/data'
import { NavUser, UserProps } from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"


export default async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const session = await auth();
    const currentUser: UserProps = {
        name: session?.user?.name!,
        email: session?.user?.email!,
        avatar: session?.user?.image!
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser 
                    name={currentUser.name} 
                    email={currentUser.email}
                    avatar={currentUser.avatar}
                />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                data.nav.map((item) => (
                                    <SidebarMenuItem key={item.name}>
                                      <SidebarMenuButton
                                        asChild
                                        isActive={item.name === "Messages & media"}
                                      >
                                        <a href="#">
                                          <item.icon />
                                          <span>{item.name}</span>
                                        </a>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
