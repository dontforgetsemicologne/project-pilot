'use client'

import { notFound, useParams } from "next/navigation";

import { api } from "@/trpc/react";

import { ArrowUpRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays, isAfter, parseISO } from "date-fns";

export default function ProjectPage() {
    const params = useParams();
    const taskId = params?.taskId as string;
    const getTask = api.task.getById.useQuery({ id: taskId });

    if(!getTask) {
        notFound();
    }

    const task = getTask.data;
    let dueLabel = "";
    let dueDateColor = "";
    let width = '';

    if (task) {
        const deadline = task.deadline ?? new Date;
        const today = new Date();
        const daysLeft = differenceInDays(deadline, today);

        if (task.status === "COMPLETED") {
            if (isAfter(today, deadline)) {
                dueLabel = "Completed (Overdue)";
                dueDateColor = "text-red-600 dark:text-red-400";
                width = 'w-52'
            } else {
                dueLabel = "Completed (On Time)";
                dueDateColor = "text-green-600 dark:text-green-400";
                width = 'w-48'
            }
        } else if (task.status === "REVIEW") {
            dueLabel = `${daysLeft} days left`;
            dueDateColor = daysLeft < 0 ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
            width = 'w-28'
        } else if (task.status === "IN_PROGRESS") {
            dueLabel = `${daysLeft} days left`;
            dueDateColor = daysLeft < 0 ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" : "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30";
            width = 'w-28'
        } else if (task.status === "PENDING") {
            dueLabel = `${daysLeft} days left`;
            dueDateColor = daysLeft < 0 ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
            width = 'w-28'
        }
    }

    let percen = 0;
    if(task) {
        if (task.status === "COMPLETED"){
            percen = 100;
        } else if(task.status === "REVIEW") {
            percen = 75;
        } else if(task.status === 'IN_PROGRESS') {
            percen = 50;
        } else if(task.status === 'PENDING') {
            percen = 0;
        }
    }

    return(
        <div className="container mx-auto py-8">
            <div className="relative h-full rounded-3xl p-6 bg-white dark:bg-black/5 border border-zinc-200 :border-zinc-800
            hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1.5">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {getTask.data?.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 w-5/6">
                            {getTask.data?.description}
                        </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${dueDateColor} text-xs font-medium ${width}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{dueLabel}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <div className="flex -space-x-2">
                        {getTask.data?.assignees.map((member) => (
                            <div key={member.id} className="relative group/member">
                                <Avatar className="h-8 w-8 border-2 border-white">
                                    <AvatarImage src={member.image ?? undefined} alt={member.name ?? ''} />
                                    <AvatarFallback>
                                        {member.name}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 opacity-0 group-hover/member:opacity-100 transition-opacity duration-200">
                                    {member.name}
                                </span>
                            </div>
                        ))}
                    </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex flex-row gap-1 mb-6">
                {getTask.data?.tags.map((tag) => {
                    const getWidthClass = (textlength: number) => {
                        if(textlength == 4)
                            return 'w-[39px]'
                        if(textlength == 5)
                            return 'w-[50px]'
                        if(textlength == 6)
                            return 'w-[57px]'
                        if(textlength == 7)
                            return 'w-[66px]'
                        if(textlength == 8)
                            return 'w-[75px]'
                        if(textlength == 9)
                            return 'w-[84px]'
                        if(textlength == 10)
                            return 'w-[93px]'
                    }
                    return (
                        <div 
                            className={`rounded-xl ${getWidthClass(tag.name.length)} ${tag.color} items-center text-center`} 
                            key={tag.id}
                        >
                            {tag.name}                            
                        </div>
                    )
                })}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Progress
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                        {getTask.data?.status}
                    </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                        className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400
                            transition-all duration-1000 ease-out"
                            style={{ width: `${percen}%` }}
                    />
                </div>
            </div>
        </div>
        </div>
    )
}