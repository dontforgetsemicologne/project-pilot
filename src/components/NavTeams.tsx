'use client'

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuSub,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { api } from "@/trpc/react";

import Link from "next/link";

export default function NavTeams() {
    const getProjects = api.project.getAll.useQuery();
    const getTeams = api.team.getAll.useQuery();
    const getProjectTeams = (projectId: string) => {
        return getTeams.data?.filter(team => team.projectId === projectId);
    }

    return(
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="justify-between">
                <Link href={'/teams'}>
                    Teams
                </Link>
            </SidebarGroupLabel>
            <SidebarMenu>
                {
                    getProjects.data?.map((item) => (
                        <Collapsible
                            key={item.id}
                            asChild
                            className="group/collapsible"
                        >
                            <SidebarMenuItem key={item.id}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton asChild>
                                        <span>{item.name}</span>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                    {
                                        getProjectTeams(item.id)?.map((team) => (
                                            <SidebarMenuSubItem key={team.id}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={`/teams/${team.id}`}>
                                                        <span>{team.name}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))
                                    } 
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}