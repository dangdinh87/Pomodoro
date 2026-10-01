import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
    LOCALE_COOKIE,
    LOCALE_COOKIE_MAX_AGE,
    isLang,
    negotiateLocale,
    type Lang,
} from '@/lib/i18n/negotiate-locale'

// Paths that need the Supabase session check. Everything else (public pages)
// only gets the cheap locale-cookie step and never calls Supabase.
const AUTH_PATH_PREFIXES = [
    '/login',
    '/signup',
    '/timer',
    '/tasks',
    '/history',
    '/settings',
    '/entertainment',
]

export function needsAuthCheck(pathname: string): boolean {
    return AUTH_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Ensure the `app.lang` cookie exists. Also writes it onto the incoming request
 * so server components rendering this very request (first visit) can read it.
 * Returns the locale to persist on the response, or null when already set.
 */
function ensureLocale(request: NextRequest): Lang | null {
    if (isLang(request.cookies.get(LOCALE_COOKIE)?.value)) return null
    const lang = negotiateLocale(request.headers.get('accept-language'))
    request.cookies.set(LOCALE_COOKIE, lang)
    return lang
}

function withLocaleCookie<T extends NextResponse>(response: T, lang: Lang | null): T {
    if (lang) {
        response.cookies.set(LOCALE_COOKIE, lang, {
            path: '/',
            maxAge: LOCALE_COOKIE_MAX_AGE,
            sameSite: 'lax',
        })
    }
    return response
}

export async function proxy(request: NextRequest) {
    const localeToSet = ensureLocale(request)

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    if (!needsAuthCheck(request.nextUrl.pathname)) {
        return withLocaleCookie(response, localeToSet)
    }

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
        return withLocaleCookie(NextResponse.redirect(new URL('/timer', request.url)), localeToSet)
    }

    return withLocaleCookie(response, localeToSet)
}

export const config = {
    // All page requests (locale cookie), minus API, Next internals, static files
    // (any path with an extension) and the OAuth callback. Supabase auth logic is
    // gated inside the handler by needsAuthCheck().
    matcher: ['/((?!api|_next|auth/callback|.*\\..*).*)'],
}
