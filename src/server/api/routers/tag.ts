import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";

export const tagRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            color: z.string().optional(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.db.tag.create({
                data: {
                    name: input.name,
                    description: input.description,
                    color: input.color,
                },
            });
        }),
  
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.tag.findMany();
    }),
});