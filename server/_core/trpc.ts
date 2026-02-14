import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
/** Procedure that allows both authenticated and unauthenticated - ctx.user may be null */
export const optionalAuthProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// Admin roles hierarchy: master_admin > super_admin > admin > user
const ADMIN_ROLES = ['admin', 'super_admin', 'master_admin'];
const SUPER_ADMIN_ROLES = ['super_admin', 'master_admin'];
const MASTER_ADMIN_ROLES = ['master_admin'];

// Any admin level can access
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !ADMIN_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Super admin or higher can access
export const superAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !SUPER_ADMIN_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Super Admin access required" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Only master admin can access
export const masterAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !MASTER_ADMIN_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Master Admin access required" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Helper to check if user can manage another user's role
export function canManageRole(managerRole: string, targetRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    'user': 0,
    'admin': 1,
    'super_admin': 2,
    'master_admin': 3,
  };
  
  return (roleHierarchy[managerRole] || 0) > (roleHierarchy[targetRole] || 0);
}

// Export role constants
export { ADMIN_ROLES, SUPER_ADMIN_ROLES, MASTER_ADMIN_ROLES };
