import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

const idSchema = z.string().min(1);
const dateSchema = z.date().optional();

export const projectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            startDate: z.date(),
            endDate: dateSchema,
            members: z.array(idSchema).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.project.create({
                data: {
                    name: input.name,
                    description: input.description,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    owner: { connect: { id: ctx.session.user.id } },
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
            status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
            startDate: dateSchema,
            endDate: dateSchema,
        }))
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.findFirst({
                where: { id: input.id, ownerId: ctx.session.user.id },
            });
            if (!project) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
            }

            return ctx.db.project.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    status: input.status,
                    startDate: input.startDate,
                    endDate: input.endDate,
                },
            });
        }),

    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.project.findMany({
            where: {
                OR: [
                    { ownerId: ctx.session.user.id },
                    { members: { some: { id: ctx.session.user.id } } },
                ],
            },
            include: {
                teams: true,
                members: true,
            },
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: idSchema }))
        .query(({ ctx, input }) => {
            return ctx.db.project.findFirst({
                where: {
                    id: input.id,
                    OR: [
                        { ownerId: ctx.session.user.id },
                        { members: { some: { id: ctx.session.user.id } } },
                    ],
                },
                include: {
                    teams: {
                        include: {
                        members: true,
                        tasks: true,
                        },
                    },
                    members: true,
                },
            });
        }),
});