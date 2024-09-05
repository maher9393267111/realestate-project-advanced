// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import dbConnect from "@/lib/db-connect";
// import User from "@/models/user";

// // Ensure database connection
// dbConnect();

// export const authOptions = {
//   session: {
//     jwt: true,
//   },
//   providers: [
//     CredentialsProvider({
//       async authorize(credentials) {
//         dbConnect();

//         const { username, password } = credentials;

//         // Check if username and password are entered
//         if (!username || !password) {
//           throw new Error('Please enter username and password');
//         }

//         // Find user in the database
//         const user = await User.findOne({ username }).select('+password');

//         if (!user) {
//           throw new Error('Invalid Username or Password');
//         }

//         // Check if password is correct
//         const isPasswordMatched = await user.comparePassword(password);

//         if (!isPasswordMatched) {
//           throw new Error('Invalid Username or Password');
//         }

//         return {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           avatar: user.avatar,
//           timeStamp: {
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt,
//           },
//         };
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     jwt: async ({ token, user }) => {
//       if (user) {
//         token.user = {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           avatar: user.avatar,
//           timeStamp: {
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt,
//           },
//         };
//       }
//       return token; // Return the entire token object
//     },
//     session: async ({ session, token }) => {
//       session.user = token.user; // Attach token user data to session
//       return session; // Return the session object
//     },
//   },
// };

// // Export the NextAuth handler
// export default async function auth(req, res) {
//   return NextAuth(req, res, authOptions); // Pass the options directly
// }














import NextAuth from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";

dbConnect();

export const authOptions = (req) => {
    return {
        providers: [
            CredentialsProviders({
                name: "Credentials",
                async authorize(credentials, req) {
                    try {
                        // find user in database and return it
                        const { username, password } = credentials;

                        if (!username || !password) {
                            throw new Error("Invalid input.");
                        }

                        const user = await User.findOne({ username }).select(
                            "+password"
                        );

                        if (!user) {
                            throw new Error(
                                "No user with a matching username was found."
                            );
                        }

                        const isPasswordMatched = await user.comparePassword(
                            password
                        );

                        if (!isPasswordMatched) {
                            throw new Error("Your password is invalid");
                        }

                        return {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            avatar: user.avatar,
                            timeStamp: {
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt,
                            },
                        };
                    } catch (error) {
                        throw new Error(error);
                    }
                },
            }),
        ],
        session: {
            strategy: "jwt",
        },
        secret: process.env.NEXTAUTH_SECRET,
        pages: {
            signIn: "/auth/signin",
        },
        callbacks: {
            async jwt({ token, user }) {
                if (
                    req.url.toString().replace(/=$|=(?=&)/g, "") ===
                    "/api/auth/session?update"
                ) {
                    const user = await User.findById(token.user.id);

                    if (!user) {
                        return;
                    }

                    token.user = {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        timeStamp: {
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt,
                        },
                    };
                } else {
                    user && (token.user = user);
                }
                return Promise.resolve(token);
            },
            async session({ session, token }) {
                session.user = token.user;
                return Promise.resolve(session);
            },
        },
        debug: process.env.NODE_ENV === "development",
    };
};

export default async function auth(req, res) {
    return NextAuth(req, res, authOptions(req));
}