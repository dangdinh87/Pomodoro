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
