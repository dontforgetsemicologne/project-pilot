'use client'

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react"
import { Mail } from "lucide-react";
import Image from "next/image";

export default function UsersPage() {

    const users = api.user.getAll.useQuery();
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8 text-center items-center">Users</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {
                    users.data?.map((user) => (
                        <div className="w-full max-w-screen-sm md:max-w-screen-md mx-auto" key={user.id}>
                            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                                <div className="flex items-center gap-5">
                                    <Image
                                        src={user.image!}
                                        alt={user.name!}
                                        width={80}
                                        height={80}
                                        className="rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                                                    {user.name}
                                                </h2>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {user.role}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`mailto:${user.email}`}>
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            <Mail className="w-4 h-4" />
                                            <a
                                                href={`mailto:${user.email}`}
                                                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                            >
                                                {user.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        Department: {user.department}
                                    </p>
                                </div>
                            </div>
            
                            
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
