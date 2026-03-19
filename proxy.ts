import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { buildLoginUrl } from "@/lib/auth"

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!isAdminRoute(request)) {
    return
  }

  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`

  await auth.protect({
    unauthenticatedUrl: buildLoginUrl(returnTo),
  })
})

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
}
