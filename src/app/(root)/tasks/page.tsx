'use client'

import { useState } from "react"
import { createColumns } from "./columns"
import { DataTable } from "./data-table"
import { Task } from "./types"
import MyForm from './add-task'

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { Loader2 } from "lucide-react"
import CommentDialog from "./comment-dialog"

export default function TasksPage() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const columns = createColumns();

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
  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      setIsDialogOpen(false);
      void tasks.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTask = api.task.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated successfully");
      setIsDialogOpen(false);
      setEditingTask(null);
      void tasks.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted successfully");
      void tasks.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = async(newTask: Omit<Task,'id'>) => {
    await createTask.mutateAsync(newTask);
  }

  const handleUpdate = async(updatedTask: Task) => {
    await updateTask.mutateAsync(updatedTask);
  }

  const handleDelete = async(id: string) => {
    await deleteTask.mutateAsync({ id });
  }

  const handleMultipleDelete = async(taskDelete: Task[]) => {
    if (!taskDelete?.length) {
      toast.error("No tasks selected for deletion");
      return;
    }
    try {
      await Promise.all(
        taskDelete.map(task => deleteTask.mutateAsync({ id: task.id})));
      toast.success("Tasks deleted successfully");
    } catch (error) {
      toast.error("Failed to delete some tasks");
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleAddComment = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsCommentDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  if (tasks.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (tasks.isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Error loading tasks: {tasks.error.message}</p>
      </div>
    );
  }

  return(
    <div className="container mx-auto py-10">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-screen-sm p-4">
          <DialogHeader>
            <DialogTitle>Add</DialogTitle>
          </DialogHeader>
          <div>
            <MyForm/>
          </div>
        </DialogContent>
      </Dialog>
      <CommentDialog
        taskId={selectedTaskId}
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
      />
      <DataTable
        columns={columns}
        data={taskData ?? []}
        onAdd={openCreateDialog}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddComment={handleAddComment}
        onMultiDelete={handleMultipleDelete}
        searchKey="title"
      />
    </div>
  )
}