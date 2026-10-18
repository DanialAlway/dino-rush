/* Spotify app settings for "Log in with Spotify".
 *
 * 1. Go to https://developer.spotify.com/dashboard and create an app.
 * 2. Redirect URI: https://danialalway.github.io/dino-rush/
 *    (and http://127.0.0.1:8000/ if you also want to test locally)
 * 3. Tick "Web API" and "Web Playback SDK", save, then copy the Client ID below.
 * 4. In the app's "User Management", add the email of every Spotify account allowed to log in
 *    (Spotify allows 5 in development mode).
 *
 * The Client ID is public by design (PKCE has no secret), so it is safe to commit.
 * Leave it empty to hide the login and keep only the embedded player. */
window.DINO_SPOTIFY_CLIENT_ID = '665de780200a4ab0b9c6d0d15bfd9904';
