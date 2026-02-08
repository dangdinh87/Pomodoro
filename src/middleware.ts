import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    // if (!user && request.nextUrl.pathname.startsWith('/tasks')) {
    //     return NextResponse.redirect(new URL('/login', request.url))
    // }

    // Auth routes (redirect to timer if already logged in)
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
        return NextResponse.redirect(new URL('/timer', request.url))
    }

    return response
}

export const config = {
    matcher: [
        // Only match routes that need auth checks.
        // Public routes (/, /guide, /leaderboard, etc.) skip middleware entirely
        // for faster crawler response and no unnecessary Supabase auth calls.
        '/login',
        '/signup',
        '/timer/:path*',
        '/tasks/:path*',
        '/history/:path*',
        '/chat/:path*',
        '/settings/:path*',
        '/progress/:path*',
        '/focus/:path*',
        '/entertainment/:path*',
    ],
}
