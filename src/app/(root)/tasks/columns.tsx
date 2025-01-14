"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MessageSquare, MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { format } from "date-fns"
import { Task } from "./types"
import { api } from "@/trpc/react"

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
    onAddComment?: (taskId: string) => void;
}

export const createColumns = (): ColumnDef<Task>[] => { 
  const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
          return <span className="font-mono text-sm">TASK-{row.getValue("id")}</span>
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
          const status: Task["status"] = row.getValue("status")
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
          const priority: Task["priority"] = row.getValue("priority")
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
          const assignees: Task["assignees"] = row.getValue("assignees")
          const users = assignees.map(id => {
            const { data: user } = api.user.getById.useQuery(id)
            return user
          }).filter(Boolean);

          return (
            <div className="flex -space-x-2">
              {users.map((user) => (
                user && (
                <Avatar key={user.id} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.email} />
                  <AvatarFallback>
                    {user.name}
                  </AvatarFallback>
                </Avatar>
                )
              ))}
            </div>
          )
        },
    },
    {
        accessorKey: "projectId",
        header: "Project",
        cell: ({ row }) => {
          const projectId: string = row.getValue("projectId");
          const project = api.project.getById.useQuery({ id: projectId });
          return project.data ? project.data.name : null;
        }
    },
    {
        accessorKey: "team.id",
        header: "Team ID",
        cell: ({ row }) => {
          const team = row.original.teamId
          return (
            <span title={team} className="font-mono text-sm">
              {team}
            </span>
          )
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags: Task["tags"] = row.getValue("tags")
          return (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className={tag.color}
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
          const date = row.getValue("startDate")
          return date ? format(date as Date, "MMM d, yyyy") : "-"
        },
    },
    {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => {
          const date = row.getValue("deadline")
          return date ? format(date as Date, "MMM d, yyyy") : "-"
        },
    }
  ];
  columns.push({
    id: "actions",
    cell: ({ row, table }) => {
      const record = row.original;
      const { onEdit, onDelete, onAddComment } = table.options.meta as ColumnActions;
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
                  { onAddComment && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAddComment(record.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />Add Comment
                      </DropdownMenuItem>
                    </>
                  )}
                  { onDelete && <DropdownMenuItem onClick={() => onDelete(record.id)}>Delete</DropdownMenuItem> }

          </DropdownMenuContent>  
        </DropdownMenu>
      );
    },
  })
  return columns
}