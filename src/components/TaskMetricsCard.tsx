'use client'

import {
    Activity,
    Users,
    ClipboardList,
    Target,
    Clock,
    CheckCircle,
} from "lucide-react";
import type { Task, User } from "@/app/(root)/tasks/types";
import { api } from "@/trpc/react";
import Image from "next/image";
import { Avatar, AvatarImage } from "./ui/avatar";

export function TaskMetricsCard({ tasks }: { tasks: Task[]}) {
    const metrics = [
        {
            label: "Total Tasks",
            value: tasks.length.toString(),
            trend: (tasks.length / tasks.length) * 100,
            icon: ClipboardList,
            color: "#007AFF"
        },
        {
            label: "In Progress",
            value: tasks.filter(t => t.status === "IN_PROGRESS").length.toString(),
            trend: (tasks.filter(t => t.status === "IN_PROGRESS").length / tasks.length) * 100,
            icon: Clock,
            color: "#FF9500"
        },
        {
            label: "Completed",
            value: tasks.filter(t => t.status === "COMPLETED").length.toString(),
            trend: (tasks.filter(t => t.status === "COMPLETED").length / tasks.length) * 100,
            icon: CheckCircle,
            color: "#34C759"
        }
    ];

    return (
        <div className="relative h-full rounded-3xl p-6 bg-white dark:bg-black/5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                    <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Task Metrics
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Overview
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                    <div key={metric.label} className="relative flex flex-col items-center">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800/50" />
                            <div
                                className="absolute inset-0 rounded-full border-4"
                                style={{
                                    borderColor: metric.color,
                                    clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {metric.value}
                                </span>
                            </div>
                        </div>
                        <span className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {metric.label}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {Math.round(metric.trend)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TaskManagementCard({ tasks }: { tasks: Task[]}) {
    const recentTasks = tasks.slice(0, 5);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "text-red-500";
            case "HIGH": return "text-orange-500";
            case "MEDIUM": return "text-yellow-500";
            default: return "text-green-500";
        }
    };

    const TaskAssignee = ({ assigneeId }: { assigneeId: string }) => {
        const { data: user } = api.user.getById.useQuery(assigneeId);
        
        return (
            <Avatar key={assigneeId}>
                <AvatarImage
                    src={user?.image ?? ''}
                    className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 border-1 border-white dark:border-zinc-800"
                />
            </Avatar>
        );
    };

    return (
        <div className="relative h-full rounded-3xl p-6 bg-white dark:bg-black/5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                    <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Recent Tasks
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Task Management
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {recentTasks.map((task) => (
                    <div key={task.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                {task.title}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-5">
                                {task.assignees?.map((assigneeId) => (
                                    <TaskAssignee key={assigneeId} assigneeId={assigneeId} />
                                ))}
                            </div>
                            <span className="text-xs text-zinc-500">
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LatestUsersCard({ users } : { users: User[] }) {
    const recentUsers = users.slice(0, 5);

    return (
        <div className="relative h-full rounded-3xl p-6 bg-white dark:bg-black/5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                    <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Latest Users
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Team Members
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                        <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700">
                            {user.image && (
                                <Image
                                    src={user.image}
                                    alt={user.name ?? ''}
                                    height={40}
                                    width={40}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {user.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                                {user.role || user.department || 'Team Member'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}