import { withAuth } from "next-auth/middleware";

export default withAuth({
    // Matches the pages config in `[...nextauth]`
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/users/:path*",
        "/departments/:path*",
        "/designations/:path*"
    ],
};
