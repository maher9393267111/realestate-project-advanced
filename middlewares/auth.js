import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import catchAsyncErrors from "./catch-async-errors";

export const isAuthenticatedUser = (handler) =>
    catchAsyncErrors(async (req, res) => {
        const session = await getServerSession(req, res, authOptions(req));

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Please Login to access this resource.",
            });
        }

        req.user = session.user;

        return handler(req, res);
    });

export const authorizeRoles = (handler, ...roles) => {
    return async (req, res) => {
        const { user } = await getServerSession(req, res, authOptions(req));

        if (!roles.includes(user?.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${user?.role} is not allowed to access this resource.`,
            });
        }
        return handler(req, res);
    };
};
