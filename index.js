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
    Suggestions,
    List
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
    conv.ask(new List({
        title: 'Things to learn about',
        items: {
            // Add the first item to the list
            'MATH_AND_PRIME': {
                synonyms: [
                    'math',
                    'math and prime',
                    'prime numbers',
                    'prime',
                ],
                title: 'Title of the First List Item',
                description: '42 is an abundant number',

            },
            // Add the second item to the list
            'EGYPT': {
                synonyms: [
                    'religion',
                    'egypt',
                    'ancient egyptian',
                ],
                title: 'Ancient Egyptian religion',
                description: '42 gods ruled on the fate of the dead in the afterworld',

            },
            // Add the last item to the list
            'RECIPES': {
                synonyms: [
                    'recipes',
                    'recipe',
                    '42 recipes',
                ],
                title: '42 recipes in 42 ingredients',
                description: 'A beautifully simple recipe',

            },
        },
    }));


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


