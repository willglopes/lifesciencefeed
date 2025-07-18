// src/pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
          {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              identifier: creds?.email,
              password: creds?.password,
            }),
          }
        )
        const user = await res.json()
        if (res.ok && user.jwt) {
          return { id: user.user.id, name: user.user.username, email: user.user.email }
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
})
