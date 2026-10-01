import { NextResponse, type NextRequest } from 'next/server'
import {
    LOCALE_COOKIE,
    LOCALE_COOKIE_MAX_AGE,
    isLang,
    negotiateLocale,
} from '@/lib/i18n/negotiate-locale'

/**
 * Ensures the `app.lang` cookie exists. It is also written onto the incoming
 * request so server components rendering this very request (first visit) can
 * read it. Auth is checked per API route, not here.
 */
export function proxy(request: NextRequest) {
    if (isLang(request.cookies.get(LOCALE_COOKIE)?.value)) return NextResponse.next()

    const lang = negotiateLocale(request.headers.get('accept-language'))
    request.cookies.set(LOCALE_COOKIE, lang)
    const response = NextResponse.next({ request: { headers: request.headers } })
    response.cookies.set(LOCALE_COOKIE, lang, {
        path: '/',
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: 'lax',
    })
    return response
}

export const config = {
    // All page requests, minus API, Next internals and static files (any path with an extension).
    matcher: ['/((?!api|_next|.*\\..*).*)'],
}
