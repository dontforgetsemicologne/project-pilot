'use client'
import { api } from "@/trpc/react";
import { LatestUsersCard, TaskManagementCard, TaskMetricsCard } from "./TaskMetricsCard";

export default function Dashboard() {
    const tasks = api.task.getAll.useQuery();
    const taskData = tasks.data?.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? undefined,
        projectId: task.projectId,
        teamId: task.teamId,
        priority: task.priority,
        status: task.status,
        startDate: task.startDate ?? new Date(),
        deadline: task.deadline ?? new Date(),
        assignees: task.assignees.map(member => member.id),
        tags: task.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color ?? 'blue'
        }))
      }))
    const users = api.user.getAll.useQuery();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TaskMetricsCard tasks={taskData ?? []}/>
            <TaskManagementCard tasks={taskData ?? []}/>
            <LatestUsersCard users={users.data?.map((user) => {
                return { 
                    id: user.id, 
                    name: user.name ?? '',
                    department: user.department ?? '',
                    email: user.email,
                    image: user.image ?? '',
                    role: user.role 
                }
            }) ?? []} />
        </div>
    );
}