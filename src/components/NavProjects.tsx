'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { api } from "@/trpc/react";
import { Folder, Forward, MoreHorizontal, Trash2 } from "lucide-react";
import CreateProject from "./CreateProject";
import { Button } from "./ui/button";
import Link from "next/link";

interface CreateProjectProps {
    userId: string;
    userName: string;
}

export default function NavProjects({ userId, userName }: CreateProjectProps) {
    const { isMobile } = useSidebar();
    const getProjects = api.project.getAll.useQuery();
    const deleteProject = api.project.delete.useMutation();
    return(
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="justify-between">
                <Link href={'/projects'}>
                    Projects
                </Link>
                <CreateProject userId={userId} userName={userName}/>
            </SidebarGroupLabel>
            <SidebarMenu>
                {
                    getProjects.data?.map((item) => (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton asChild>
                                <a href={`/projects/${item.id}`}>
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction showOnHover>
                                        <MoreHorizontal /><span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-48 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align={isMobile ? "end" : "start"}
                                >
                                    <DropdownMenuItem>
                                        <Folder className="text-muted-foreground" /><span>View Project</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Forward className="text-muted-foreground" /><span>Share Project</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Button 
                                            variant={'none'} 
                                            size={'none'}
                                            onClick={() => {deleteProject.mutate({ id: item.id})}}
                                        >
                                            <Trash2 className="text-muted-foreground" /><span>Delete Project</span>
                                        </Button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}