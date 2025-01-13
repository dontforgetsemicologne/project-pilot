"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MoreVertical, Trash2, PencilLine } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { api } from "@/trpc/react"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
})

type CommentDialogProps = {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommentDialog({ taskId, open, onOpenChange }: CommentDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const form = useForm<z.infer<typeof commentSchema>>({
    defaultValues: {
      content: "",
    },
  })

  const utils = api.useUtils()
  const { data: comments, isLoading } = api.comment.getByTaskId.useQuery(taskId ?? "", {
    enabled: !!taskId,
  })

  const addComment = api.comment.create.useMutation({
    onSuccess: () => {
      form.reset()
      void utils.comment.getByTaskId.invalidate(taskId ?? "")
      toast.success("Comment added successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateComment = api.comment.update.useMutation({
    onSuccess: () => {
      setEditingId(null)
      void utils.comment.getByTaskId.invalidate(taskId ?? "")
      toast.success("Comment updated successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => {
      void utils.comment.getByTaskId.invalidate(taskId ?? "")
      toast.success("Comment deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (values: z.infer<typeof commentSchema>) => {
    if (!taskId) return

    if (editingId) {
      await updateComment.mutateAsync({
        id: editingId,
        content: values.content,
      })
    } else {
      await addComment.mutateAsync({
        taskId,
        content: values.content,
      })
    }
  }

  const handleEdit = (id: string, content: string) => {
    setEditingId(id)
    form.setValue("content", content)
  }

  const handleDelete = async (id: string) => {
    await deleteComment.mutateAsync({ id })
  }

  const handleCancel = () => {
    setEditingId(null)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add a comment..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit">
                  {editingId ? "Update" : "Comment"}
                </Button>
              </div>
            </form>
          </Form>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-4 rounded-lg border p-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.image ?? undefined} />
                      <AvatarFallback>
                        {comment.user.name?.[0] ?? comment.user.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {comment.user.name ?? comment.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(comment.id, comment.content)}>
                              <PencilLine className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="mt-2 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}