export interface YouTubeOEmbedResponse {
    title: string;
    author_name: string;
    author_url: string;
    type: string;
    height: number;
    width: number;
    version: string;
    provider_name: string;
    provider_url: string;
    thumbnail_height: number;
    thumbnail_width: number;
    thumbnail_url: string;
    html: string;
}

export const fetchYouTubeOEmbed = async (url: string): Promise<YouTubeOEmbedResponse | null> => {
    try {
        // Construct the oEmbed URL
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

        const response = await fetch(oEmbedUrl);

        if (!response.ok) {
            console.warn(`Failed to fetch oEmbed data: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data as YouTubeOEmbedResponse;
    } catch (error) {
        console.error('Error fetching YouTube oEmbed data:', error);
        return null;
    }
};

/**
 * i18n key of the toast for an IFrame API `onError` code
 * (https://developers.google.com/youtube/iframe_api_reference#onError):
 * 100 = removed or private, 101/150 = the owner does not allow embedding,
 * 2 (bad parameter), 5 (HTML5 player error) and anything else = generic.
 */
export const youtubeErrorKey = (code: number | undefined): string => {
    switch (code) {
        case 100:
            return 'audio.youtube.errors.notFound';
        case 101:
        case 150:
            return 'audio.youtube.errors.embedBlocked';
        default:
            return 'audio.youtube.errors.cannotPlay';
    }
};
