import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(({ ctx }) => {
      return ctx.db.user.findMany();
    }),
  getById: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      return ctx.db.user.findUnique({ where: { id: input } });
    })
  ,
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      role: z.string().optional(),
      department: z.string().optional(),
    }))
    .mutation(async({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id
        }
      });
      if(!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          role: input.role,
          department: input.department
        }
      })
    })
})