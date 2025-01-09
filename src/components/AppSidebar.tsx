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
} from "@/components/ui/sidebar"
import NavProjects from "@/components/NavProjects";
import NavTasks from "./NavTasks";
import NavTeams from "./NavTeams";


export default async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const session = await auth();
    const currentUser: UserProps = {
        name: session?.user?.name!,
        email: session?.user?.email!,
        avatar: session?.user?.image!
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
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
                        <NavProjects 
                            userId={session?.user.id!} 
                            userName={session?.user.name! ?? ""}
                        />
                        <NavTasks/>
                        <NavTeams/>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="h-16">
                <NavUser 
                    name={currentUser.name} 
                    email={currentUser.email}
                    avatar={currentUser.avatar}
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
