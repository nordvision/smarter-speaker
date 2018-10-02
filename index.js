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
    console.log(genreList);
    _.forEach(genreIds, id => {
        genreTitles.push(_.find(genreList.genres, genre => {
            console.log(id);
            return genre.id == id
        }))
    })
    let genreResponse = []
    genreResponse.push(genreTitles[0].name);
    genreResponse.push(genreTitles[1].name);
    console.log(genreResponse);
    conv.ask('testing');


    /*if(movieResult.results.length > 10){
        conv.ask(new TransactionDecision({
            intent: 'test2'
        }))
    }else{
        conv.ask(new SimpleResponse({
            speech: movieResult.results[0].title,
            text: movieResult.results[0].title
        }))
    }*/
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

});
*/

expressApp.listen(port, () => console.log(`Smarter speaker app listening on port ${port}!`))


