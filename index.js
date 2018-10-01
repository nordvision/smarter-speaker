require('dotenv').config()
const MovieDb = require('moviedb-promise')
const moviedb = new MovieDb(process.env.TMDB_APIKEY)
const express = require('express')
const bodyParser = require('body-parser')
const {
    dialogflow,
    SimpleResponse
} = require('actions-on-google')
const app = dialogflow()
const expressApp = express().use(bodyParser.json())
const port = 8081

app.intent('test', async conv => {
    let actorResult = await moviedb.searchPerson({ query: conv.parameters.actors });
    let movieResult = await moviedb.discoverMovie({ 'with_people': actorResult.results[0].id })
    conv.ask(new SimpleResponse({
        speech: movieResult.results[0].title,
        text: movieResult.results[0].title
    }))

})
expressApp.get('/healthcheck', (req, res) => res.sendStatus(200));

expressApp.post('/fulfillment', app)

expressApp.get('/', (req, res) => res.send('Hello from smarter speaker!'));

/*
expressApp.get('/search/actor', (req, res) => {
    let query = req.query.q
    moviedb.searchPerson({ query: query }).then(actorResult => {
        moviedb.discoverMovie({ 'with_people': actorResult.results[0].id }).then(movieResult => {
            res.send(movieResult.results[0].title);
        })
    }).catch(console.error);

});*/

expressApp.listen(port, () => console.log(`Smarter speaker app listening on port ${port}!`))


