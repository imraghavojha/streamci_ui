import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// define which routes should be protected
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
    // protect dashboard routes - require authentication
    if (isProtectedRoute(req)) {
        await auth.protect()
    }
    // all other routes (/, /sign-in, /sign-up) are public by default
})

export const config = {
    matcher: [
        // skip next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // always run for api routes
        '/(api|trpc)(.*)',
    ],
}