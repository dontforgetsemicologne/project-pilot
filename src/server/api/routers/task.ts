import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

const idSchema = z.string().min(1);
const dateSchema = z.date().optional();

export const taskRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            title: z.string().min(1),
            description: z.string().optional(),
            teamId: idSchema,
            projectId: idSchema,
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
            startDate: dateSchema,
            deadline: dateSchema,
            assignees: z.array(idSchema).optional(),
            tags: z.array(z.object({
                id: z.string(),
                label: z.string(),
                color: z.string().optional()
            })),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.task.create({
                data: {
                    title: input.title,
                    description: input.description,
                    team: { connect: { id: input.teamId } },
                    project: { connect: { id: input.projectId } },
                    priority: input.priority,
                    startDate: input.startDate,
                    deadline: input.deadline,
                    createdBy: { connect: { id: ctx.session.user.id } },
                    assignees: input.assignees ? {
                        connect: input.assignees.map(id => ({ id }))
                    } : undefined,
                    tags: input.tags ? {
                        connect: input.tags.map(tag => ({ 
                            id: tag.id,
                            label: tag.label,
                            color: tag.color
                        }))
                    } : undefined,
                },
            });
        }),
  
    update: protectedProcedure
        .input(z.object({
            id: idSchema,
            title: z.string().optional(),
            description: z.string().optional(),
            status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
            startDate: dateSchema,
            deadline: dateSchema,
            assignees: z.array(idSchema).optional(),
            tags: z.array(z.object({
                id: z.string(),
                label: z.string(),
                color: z.string().optional()
            })),
        }))
        .mutation(async ({ ctx, input }) => {
            const task = await ctx.db.task.findFirst({
                where: {
                    id: input.id,
                    OR: [
                        { createdById: ctx.session.user.id },
                        { assignees: { some: { id: ctx.session.user.id } } },
                    ],
                },
            });
            if (!task) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
            }
  
            return ctx.db.task.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                    status: input.status,
                    priority: input.priority,
                    startDate: input.startDate,
                    deadline: input.deadline,
                    assignees: input.assignees ? {
                        set: input.assignees.map(id => ({ id }))
                    } : undefined,
                    tags: input.tags ? {
                        set: input.tags.map(tag => ({ 
                            id: tag.id,
                            label: tag.label,
                            color: tag.color
                         }))
                    } : undefined,
                },
            });
        }),
  
    getAll: protectedProcedure
        .input(z.object({
            projectId: idSchema.optional(),
            teamId: idSchema.optional(),
            status: z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
        }))
        .query(({ ctx, input }) => {
            return ctx.db.task.findMany({
                where: {
                    projectId: input.projectId,
                    teamId: input.teamId,
                    status: input.status,
                    OR: [
                        { createdById: ctx.session.user.id },
                        { assignees: { some: { id: ctx.session.user.id } } },
                    ],
                },
                include: {
                    assignees: true,
                    tags: true,
                    comments: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
        }),
});