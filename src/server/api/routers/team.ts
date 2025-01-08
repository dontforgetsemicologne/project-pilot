import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

const idSchema = z.string().min(1);

export const teamRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            projectId: idSchema,
            members: z.array(idSchema).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.findFirst({
                where: {
                    id: input.projectId,
                    OR: [
                        { ownerId: ctx.session.user.id },
                        { members: { some: { id: ctx.session.user.id } } },
                    ],
                },
            });
            if (!project) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
            }
    
            return ctx.db.team.create({
                data: {
                    name: input.name,
                    description: input.description,
                    project: { connect: { id: input.projectId } },
                    lead: { connect: { id: ctx.session.user.id } },
                    members: input.members ? {
                        connect: input.members.map(id => ({ id }))
                    } : undefined,
                },
            });
        }),
  
    update: protectedProcedure
        .input(z.object({
            id: idSchema,
            name: z.string().optional(),
            description: z.string().optional(),
            members: z.array(idSchema).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const team = await ctx.db.team.findFirst({
                where: { id: input.id, leadId: ctx.session.user.id },
            });
  
            if (!team) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
            }
  
            return ctx.db.team.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    members: input.members ? {
                        set: input.members.map(id => ({ id }))
                    } : undefined,
                },
            });
        }),
    getAll: protectedProcedure.query(({ ctx }) => {
            return ctx.db.team.findMany({
                where: { 
                    OR: [
                        { leadId: ctx.session.user.id },
                        { members: { some: { id: ctx.session.user.id } } },
                    ], 
                },
            })
        }),
    
    getById: protectedProcedure
        .input(z.object({ id: idSchema }))
        .query(({ ctx, input }) => {
            return ctx.db.team.findFirst({
                where: {
                    id: input.id,
                    OR: [
                        { leadId: ctx.session.user.id },
                        { members: { some: { id: ctx.session.user.id } } },
                    ],
                },
                include: {
                    members: true
                }
            });
        }),

  });