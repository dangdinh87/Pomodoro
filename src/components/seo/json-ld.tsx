import { serializeJsonLd } from '@/lib/seo/json-ld';

/** One <script type="application/ld+json"> in the server HTML. Data comes from `@/lib/seo/json-ld`. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
