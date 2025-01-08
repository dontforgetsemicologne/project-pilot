'use client'

import { notFound, useParams } from "next/navigation";
import { Users, Mail, Plus, MoreHorizontal, Shield } from "lucide-react";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
    const params = useParams();
    const teamId = params.teamId as string;
    const getTeam = api.team.getById.useQuery({
        id: teamId
    });

    if(!getTeam) {
        notFound();
    }
    return (
        <div className="w-full max-w-screen-lg mx-auto">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                {getTeam.data?.name}
                            </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {getTeam.data?.description}
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {getTeam.data?.members.length} members
                </div>
                <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {
                        getTeam.data?.members.filter(member => member.id === getTeam.data?.leadId).length
                    }{" "}
                    admins
                </div>
            </div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {getTeam.data?.members.map((member) => (
                <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900"
                >
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {member.name}
                            </h3>
                            <Badge
                                variant="secondary"
                                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            >
                                Active
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {member.role}
                            </p>
                            <a
                                href={`mailto:${member.email}`}
                                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
                            >
                                <Mail className="w-3 h-3" />
                                {member.email}
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-zinc-200 dark:border-zinc-800"
                        >
                            {
                                member.id === getTeam.data?.leadId ? 'Owner' : 'Users'
                            }
                        </Badge>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
</div>
);
}
