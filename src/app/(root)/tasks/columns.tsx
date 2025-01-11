"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { format } from "date-fns"

export type Task = {
    id: string
    title: string
    status: "PENDING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    startDate: Date | null
    deadline: Date | null
    project: {
      name: string
    }
    team: {
        id: string
        name: string
    }
    assignees: Array<{
        id: string
        name: string | null
        image: string | null
        email: string
    }>
    tags: Array<{
        id: string
        name: string
        color: string | null
    }>
}

const statusColors: Record<Task['status'], string> = {
    PENDING: "bg-gray-200 text-gray-700",
    IN_PROGRESS: "bg-blue-200 text-blue-700",
    REVIEW: "bg-yellow-200 text-yellow-700",
    COMPLETED: "bg-green-200 text-green-700",
}
  
const priorityColors: Record<Task['priority'], string> = {
    LOW: "bg-gray-200 text-gray-700",
    MEDIUM: "bg-blue-200 text-blue-700",
    HIGH: "bg-yellow-200 text-yellow-700",
    URGENT: "bg-red-200 text-red-700",
}

interface ColumnActions {
    onEdit?: (data: Task) => void;
    onDelete?: (id: string) => void;
}

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
          return <span className="font-mono text-sm">{row.getValue("id")}</span>
        },
    },
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as Task["status"]
          return (
            <Badge className={statusColors[status]}>
              {status.replace("_", " ")}
            </Badge>
          )
        },
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as Task["priority"]
          return (
            <Badge className={priorityColors[priority]}>
              {priority}
            </Badge>
          )
        },
    },
    {
        accessorKey: "assignees",
        header: "Assignees",
        cell: ({ row }) => {
          const assignees = row.getValue("assignees") as Task["assignees"]
          return (
            <div className="flex -space-x-2">
              {assignees.map((assignee) => (
                <Avatar key={assignee.id} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={assignee.image ?? undefined} alt={assignee.name ?? assignee.email} />
                  <AvatarFallback>
                    {assignee.name ?? assignee.email.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )
        },
    },
    {
        accessorKey: "project.name",
        header: "Project",
    },
    {
        accessorKey: "team.id",
        header: "Team ID",
        cell: ({ row }) => {
          const team = row.original.team
          return (
            <span title={team.name} className="font-mono text-sm">
              {team.id}
            </span>
          )
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.getValue("tags") as Task["tags"]
          return (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className="text-xs"
                  style={{ backgroundColor: tag.color ?? "#e5e7eb" }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )
        },
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
          const date = row.getValue("startDate") as Date | null
          return date ? format(date, "MMM d, yyyy") : "-"
        },
    },
    {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => {
          const date = row.getValue("deadline") as Date | null
          return date ? format(date, "MMM d, yyyy") : "-"
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const record = row.original;
            const { onEdit, onDelete } = table.options.meta as ColumnActions;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            { onEdit && <DropdownMenuItem onClick={() => onEdit(record)}>Edit</DropdownMenuItem> }
                            { onDelete && <DropdownMenuItem onClick={() => onDelete(record.id)}>Delete</DropdownMenuItem> }
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
];


