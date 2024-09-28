// https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
// https://developer.spotify.com/documentation/web-api/concepts/access-token
// https://developer.spotify.com/documentation/web-api/reference/get-recommendations

import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Track as SpotifyTrack } from "@spotify/web-api-ts-sdk";
// type SpotifyId = string

// export async function fetchTrackRecommendations(
//     seed_tracks: SpotifyId[],
//     seed_artists: SpotifyId[],
//     seed_genres: string[],
// ) {
//     const recommendations = await api.recommendations.get({
//         // Lists of Spotify IDs https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
//         seed_tracks: seed_tracks,
//         // Lists of Spotify IDs https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
//         seed_artists: [],
//         // Lists of genres here https://developer.spotify.com/documentation/web-api/reference/get-recommendation-genres
//         seed_genres: [],
//         limit: 100 // Optional: number of recommendations you want
//     });
//     return recommendations;
// }

// run().then(
//     (items) => {
//         items.tracks.forEach(track => {
//             console.log(track.name, track.artists.map(artist => artist.name).join(', '));
//         });
//     }
// )

export class SpotifyApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SpotifyApiError";
    }
}

/**
 * @param title
 * @param author
 * @param api
 * @throws SpotifyApiError if something went wrong when fetching from SpotifyAPI.
 * @returns
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
