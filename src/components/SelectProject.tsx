import React, { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from 'cmdk';
import { api } from "@/trpc/react";
import { useFormContext } from "react-hook-form";

interface User {
    id: string;
    name: string;
}

interface Project {
    id: string;
    name: string;
    members: User[];
}

export default function ProjectUserSelect() {
    const form = useFormContext();
    const projects = api.project.getAll.useQuery();

    const projectInputRef = useRef<HTMLInputElement>(null);
    const userInputRef = useRef<HTMLInputElement>(null);
    
    const [projectOpen, setProjectOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    
    const [projectInputValue, setProjectInputValue] = useState("");
    const [userInputValue, setUserInputValue] = useState("");

    const handleProjectSelect = useCallback((project: Project) => {
        setProjectInputValue("");
        setSelectedProject({
            id: project.id,
            name: project.name,
            members: project.members.map((member) => ({
                id: member.id,
                name: member.name ?? ''
            }))
        });
        setSelectedUsers([]); // Reset selected users when project changes
        form.setValue('projectId', project.id, {
            shouldValidate: true,
            shouldDirty: true,
        });
    }, [form]);

    const handleUserSelect = useCallback((user: User) => {
        setUserInputValue("");
        setSelectedUsers((prev) => {
            if (prev.some(selectedUser => selectedUser.id === user.id)) {
                return prev;
            }
            const newSelected = [...prev, user];
            form.setValue('assignees', newSelected.map(u => u.id), {
                shouldValidate: true,
                shouldDirty: true,
            });
            return newSelected;
        });
    }, [form]);

    const handleUserUnselect = useCallback((user: User) => {
        setSelectedUsers((prev) => {
            const newSelected = prev.filter((s) => s.id !== user.id);
            form.setValue('assignees', newSelected.map(u => u.id), {
                shouldValidate: true,
                shouldDirty: true,
            });
            return newSelected;
        });
    }, [form]);

    const handleUserKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = userInputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    setSelectedUsers((prev) => {
                        if (prev.length === 0) return prev;
                        const newSelected = [...prev];
                        newSelected.pop();
                        form.setValue('assignees', newSelected.map(u => u.id), {
                            shouldValidate: true,
                            shouldDirty: true,
                        });
                        return newSelected;
                    });
                }
            }
            if (e.key === "Escape") {
                input.blur();
            }
        }
    }, [form]);

    const selectableUsers = selectedProject?.members.filter(
        user => !selectedUsers.some(selectedUser => selectedUser.id === user.id)
    ) || [];

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium mb-2 block">Select Project</label>
                <Command className="overflow-visible bg-transparent">
                    <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <div className="flex flex-wrap gap-1">
                            {selectedProject && (
                                <Badge variant="secondary">
                                    {selectedProject.name}
                                    <button
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onClick={() => {
                                            setSelectedProject(null);
                                            setSelectedUsers([]);
                                            form.setValue('projectId', '', {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                            form.setValue('assignees', [], {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            )}
                            <CommandPrimitive.Input
                                ref={projectInputRef}
                                value={projectInputValue}
                                onValueChange={setProjectInputValue}
                                onBlur={() => setProjectOpen(false)}
                                onFocus={() => setProjectOpen(true)}
                                placeholder="Select a project..."
                                className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                    <div className="relative mt-2">
                        <CommandList>
                            {projectOpen && projects.data?.length ? (
                                <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                                    <CommandGroup>
                                        {projects.data.map((project) => (
                                            <CommandItem
                                                key={project.id}
                                                onSelect={() => handleProjectSelect({
                                                    id: project.id,
                                                    name: project.name,
                                                    members: project.members.map((member) => ({
                                                        id: member.id,
                                                        name: member.name ?? ''
                                                    }))
                                                })}
                                                className="cursor-pointer"
                                            >
                                                {project.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </div>
                            ) : null}
                        </CommandList>
                    </div>
                </Command>
            </div>

            {selectedProject && (
                <div>
                    <label className="text-sm font-medium mb-2 block">Select Users</label>
                    <Command onKeyDown={handleUserKeyDown} className="overflow-visible bg-transparent">
                        <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <div className="flex flex-wrap gap-1">
                                {selectedUsers.map((user) => (
                                    <Badge key={user.id} variant="secondary">
                                        {user.name}
                                        <button
                                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onClick={() => handleUserUnselect(user)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                                <CommandPrimitive.Input
                                    ref={userInputRef}
                                    value={userInputValue}
                                    onValueChange={setUserInputValue}
                                    onBlur={() => setUserOpen(false)}
                                    onFocus={() => setUserOpen(true)}
                                    placeholder="Select users from project..."
                                    className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>
                        <div className="relative mt-2">
                            <CommandList>
                                {userOpen && selectableUsers.length > 0 ? (
                                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                                        <CommandGroup>
                                            {selectableUsers.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    onSelect={() => handleUserSelect(user)}
                                                    className="cursor-pointer"
                                                >
                                                    {user.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </div>
                                ) : null}
                            </CommandList>
                        </div>
                    </Command>
                </div>
            )}
            <input type="hidden" {...form.register('projectId')} />
            <input type="hidden" {...form.register('assignees')} />
        </div>
    );
}