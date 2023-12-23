// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

// export default midd;

export { default } from "next-auth/middleware";

export const config = { matcher: ["/dashboard/:path*"] };
