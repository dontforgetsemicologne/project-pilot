import * as React from "react"

import { auth } from "@/server/auth";
import { NavUser, type UserProps } from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import NavProjects from "@/components/NavProjects";
import NavTasks from "@/components/NavTasks";
import NavTeams from "@/components/NavTeams";
import Logo from "./Logo";


export default async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const session = await auth();
    
    if (!session?.user) {
        throw new Error("User session is not available");
    }

    const currentUser: UserProps = {
        name: session.user.name ?? "Unknown User",
        email: session.user.email ?? "unknown@example.com",
        avatar: session.user.image ?? "/default-avatar.png"
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="px-6 items-center justify-center">
                <Logo/>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavProjects 
                            userId={session?.user.id} 
                            userName={session?.user.name ?? "Unknown User"}
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
