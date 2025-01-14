import { z } from "zod"

const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  taskId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    image: z.string().nullable()
  }),
})

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().min(1),
  teamId: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default('MEDIUM'),
  status: z.enum(["PENDING","IN_PROGRESS","REVIEW","COMPLETED"]),
  startDate: z.date(),
  deadline: z.date(),
  assignees: z.array(z.string()),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string()
  })).default([]),
})

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string(),
  role: z.string(),
  department: z.string()
})

export type Comment = z.infer<typeof commentSchema>
export type Task = z.infer<typeof taskSchema>
export type User = z.infer<typeof userSchema>