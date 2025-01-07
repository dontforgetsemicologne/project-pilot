'use client'
import { useCallback, useRef, useState } from "react";
import { X, Lock } from "lucide-react";
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

export default function MultiFunction({ id, name }: User) {
    const form = useFormContext();
    const users = api.user.getAll.useQuery();

    // Filter out duplicates and ensure current user is excluded
    const USERS: User[] = Array.from(
        new Set(
            (users.data ?? [])
                .filter(user => user.id !== id)
                .map((user) => ({
                    id: user.id!,
                    name: user.name!
                }))
        )
    );

    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<User[]>([]);
    const [inputValue, setInputValue] = useState("");
    
    const updateFormValue = useCallback((users: User[]) => {
        // Always include the creator in the form value
        const uniqueUsers = Array.from(
            new Map([
                { id, name }, // Creator is always first
                ...users
            ].map(user => [user.id, user])).values()
        );
        const memberIds = uniqueUsers.map(user => user.id);
        form.setValue('members', memberIds, {
            shouldValidate: true,
            shouldDirty: true,
        });
    }, [form, id, name]);

    const handleUnselect = useCallback((user: User) => {
        // Prevent removing the creator
        if (user.id === id) return;
        
        setSelected((prev) => {
            const newSelected = prev.filter((s) => s.id !== user.id);
            updateFormValue(newSelected);
            return newSelected;
        });
    }, [updateFormValue, id]);

    const handleSelect = useCallback((user: User) => {
        setInputValue("");
        setSelected((prev) => {
            // Check if user is already selected
            if (prev.some(selectedUser => selectedUser.id === user.id)) {
                return prev;
            }
            const newSelected = [...prev, user];
            updateFormValue(newSelected);
            return newSelected;
        });
    }, [updateFormValue]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    setSelected((prev) => {
                        // Don't remove if only creator is left
                        if (prev.length === 0) return prev;
                        const newSelected = [...prev];
                        newSelected.pop();
                        updateFormValue(newSelected);
                        return newSelected;
                    });
                }
            }
            if (e.key === "Escape") {
                input.blur();
            }
        }
    }, [updateFormValue]);

    // Filter out already selected users from the selectable options
    const selectables = USERS.filter(
        (user) => !selected.some(selectedUser => selectedUser.id === user.id)
    );
    
    return (
        <div>
            <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
                <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <div className="flex flex-wrap gap-1">
                    {/* Show creator first */}
                    <Badge key={id} variant="secondary" className="bg-secondary/50">
                        {name}
                        <Lock className="ml-1 h-3 w-3 text-muted-foreground" />
                    </Badge>
                    {/* Show other selected users */}
                    {selected.map((user) => (
                        <Badge key={user.id} variant="secondary">
                            {user.name}
                            <button
                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(user);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(user)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder="Select team members..."
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                    </div>
                </div>
                <div className="relative mt-2">
                    <CommandList>
                    {open && selectables.length > 0 ? (
                        <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandGroup className="h-full overflow-auto">
                            {selectables.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onSelect={() => handleSelect(user)}
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
            <input 
                type="hidden" 
                {...form.register('members')}
            />
        </div>
    );
}