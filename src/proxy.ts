import { NextResponse, type NextRequest } from 'next/server'
import { resolveLocaleRoute } from '@/lib/i18n/locale-routing'

/**
 * Language lives in the URL: English is unprefixed (`/`, `/guide`) and served from the `/en`
 * tree by an internal rewrite, `/vi` and `/ja` are real prefixes, `/en/*` is a 308 to the
 * unprefixed URL. There is deliberately no redirect by cookie or Accept-Language (crawlers
 * must see one URL per language); the client only suggests another language with a banner.
 * The rules and their reasons are in `@/lib/i18n/locale-routing`.
 */
export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl
    const route = resolveLocaleRoute(pathname, search)
    if (route.action === 'next') return NextResponse.next()

    const url = request.nextUrl.clone()
    url.pathname = route.pathname
    if (route.action === 'rewrite') return NextResponse.rewrite(url)

    url.search = route.search
    return NextResponse.redirect(url, 308)
}

export const config = {
    // Page requests only: not the API, Next/Vercel internals (/_vercel/insights, /_vercel/speed-insights),
    // /dev or anything with an extension (static files).
    matcher: ['/((?!api(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|dev(?:/|$)|.*\\..*).*)'],
}
