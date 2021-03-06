require('dotenv').config()
const MovieDb = require('moviedb-promise')
const moviedb = new MovieDb(process.env.TMDB_APIKEY)
const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const {
    dialogflow,
    SimpleResponse,
    TransactionDecision,
    Suggestions
} = require('actions-on-google')
const app = dialogflow()
const expressApp = express().use(bodyParser.json())
const port = 8081

app.intent('test', async conv => {
    let actorResult = await moviedb.searchPerson({ query: conv.parameters.actors });

    let movieResult = await moviedb.discoverMovie({ 'with_people': actorResult.results[0].id })
    let genreList = await moviedb.genreMovieList();
    let genreIds = [];


    for (let index = 0; index < movieResult.results.length; index++) {
        const resultElement = movieResult.results[index];
        genreIds = _.union(genreIds, resultElement.genre_ids)
    }
    let genreTitles = [];

    _.forEach(genreIds, id => {
        genreTitles.push(_.find(genreList.genres, genre => {
            return genre.id == id
        }))
    })

    let genreResponse = []
    genreResponse.push(genreTitles[0].name);
    genreResponse.push(genreTitles[1].name);

    let genreData = [];
    genreData[genreTitles[0].name] = genreTitles[0].id;
    genreData[genreTitles[1].name] = genreTitles[1].id;
    conv.data.actor = actorResult.results[0].id;
    conv.data.genreData = genreData;

    conv.ask(`Do you want to watch a ${genreTitles[0].name} or a ${genreTitles[1].name} movie`);

})

app.intent('test - custom', async conv => {
    let genreId = conv.data.genreData[conv.parameters.genres]
    let movieResult = await moviedb.discoverMovie({ 'with_people': conv.data.actor, 'with_genres': genreId })
    conv.data.movieResult = movieResult;
    conv.data.count = 0;
    conv.ask(`Is ${movieResult.results[conv.data.count].title} the movie you are looking for`);
})

app.intent('test - custom - no', conv => {
    conv.data.count++;
    conv.ask(`Is ${conv.data.movieResult.results[conv.data.count].title} the movie you are looking for`);
})

expressApp.get('/healthcheck', (req, res) => res.sendStatus(200));

expressApp.post('/fulfillment', app)

expressApp.get('/', (req, res) => res.send('Hello from smarter speaker!'));

expressApp.listen(port, () => console.log(`Smarter speaker app listening on port ${port}!`))


