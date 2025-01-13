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
import CreateTask from "./CreateTask";

export default function NavTasks() {
    const getProjects = api.project.getAll.useQuery();
    const getTasks = api.task.getAll.useQuery();
    const getProjectTasks = (projectId: string) => {
        return getTasks.data?.filter(task => task.projectId === projectId) ?? [];
    };

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="justify-between">
                <Link href={'/tasks'}>
                    Tasks
                </Link>
                <CreateTask/>
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
                                        getProjectTasks(item.id).map((task) => (
                                            <SidebarMenuSubItem key={task.id}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={`/tasks/${task.id}`}>
                                                        <span>{task.title}</span>
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