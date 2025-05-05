// import NextAuth from "next-auth";
// import { authOptions } from "../../../lib/auth";

// // export default NextAuth(authOptions); 

// export const authOptions = {
//     // ...
//     pages: {
//         signIn: '/login', // только относительный путь!
//         // signOut: '/logout', // если нужно
//     },
//     callbacks: {
//         async redirect({ baseUrl }: { baseUrl: string }) {
//             return baseUrl;
//         }
//     }
// }

// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth";

export default NextAuth(authOptions);

