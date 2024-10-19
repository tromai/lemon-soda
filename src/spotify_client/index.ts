// https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
// https://developer.spotify.com/documentation/web-api/concepts/access-token
// https://developer.spotify.com/documentation/web-api/reference/get-recommendations

import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Track as SpotifyTrack } from "@spotify/web-api-ts-sdk";

/**
 * Raised when there is an error with using the Spotify API.
 */
export class SpotifyApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SpotifyApiError";
    }
}

/**
 * Get an array of recommended tracks from Spotify from a given song specified by `title` and `author`.
 * We will raise error if `title` and `author` don't resolve to a valid track on Spotify.
 *
 * @param {string} title The title of the song
 * @param {string} author The name of the author
 * @param {SpotifyApi} api An instance of {@link SpotifyApi}
 * @throws {SpotifyApiError} if there is an error when trying to fetch from Spotify's API.
 * @returns {Promise<SpotifyTrack[]>} A promise that resolves into an array of {@link SpotifyTrack}
 */
export async function getTrackRecommendations(
    title: string,
    author: string,
    api: SpotifyApi,
): Promise<SpotifyTrack[]> {
    // Perform a search using the track name and author.
    // https://developer.spotify.com/documentation/web-api/reference/search
    const searchResults = await api.search(
        `${title} ${author}`,
        ["track"],
        undefined,
        1,
    );

    const spotifyTrack: SpotifyTrack | undefined =
        searchResults.tracks.items.pop();
    if (!spotifyTrack) {
        throw new SpotifyApiError(
            "Cannot find the corresponding Spotify track.",
        );
    }

    // https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    const recommendationResponse = await api.recommendations.get({
        // Lists of Spotify IDs
        // https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
        seed_tracks: [spotifyTrack.id],
        limit: 100, // Maxium 100
    });

    return recommendationResponse.tracks;
}
