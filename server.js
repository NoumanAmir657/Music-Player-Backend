require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder');
const cors = require('cors');


const app = express();
app.use(express.static('build'))
app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
    const code = req.body.code;
    // change here
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    })

    spotifyApi
    .authorizationCodeGrant(code).then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
    })
    .catch((err) => {
        console.log(err)
        res.sendStatus(400)
    })
})

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    console.log(refreshToken)
    // change here
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: refreshToken
    })

    spotifyApi.refreshAccessToken()
    .then(data => {
        res.json({
            accessToken: data.body.accessToken,
            expiresIn: data.body.expiresIn,
        })
    })
    .catch(err => {
        console.log(err)
    })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.title) || "No Lyrics Found"
    res.json({lyrics})
})

app.listen(process.env.PORT, () => console.log('listening on 3001'))