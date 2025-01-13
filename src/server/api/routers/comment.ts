import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";

const idSchema = z.string().min(1);

export const commentRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            content: z.string().min(1),
            taskId: idSchema,
        }))
        .mutation(({ ctx, input }) => {
            return ctx.db.comment.create({
                data: {
                    content: input.content,
                    task: { connect: { id: input.taskId } },
                    user: { connect: { id: ctx.session.user.id } },
                },
            });
        }),
  
    update: protectedProcedure
        .input(z.object({
            id: idSchema,
            content: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.db.comment.findFirst({
                where: { id: input.id, userId: ctx.session.user.id },
            });
  
            if (!comment) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }
  
            return ctx.db.comment.update({
                where: { id: input.id },
                data: { content: input.content },
            });
        }),
  
    delete: protectedProcedure
        .input(z.object({ id: idSchema }))
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.db.comment.findFirst({
                where: { id: input.id, userId: ctx.session.user.id },
            });
            if (!comment) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }

            return ctx.db.comment.delete({ where: { id: input.id } });
        }),
    getByTaskId: protectedProcedure
        .input(z.string())
        .query(async({ ctx, input }) => {
            const comments = await ctx.db.comment.findMany({
                where: { taskId: input },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
            });
            return comments;
        })
    });