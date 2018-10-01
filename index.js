require('dotenv').config()
const MovieDb = require('moviedb-promise')
const moviedb = new MovieDb(process.env.APIKEY)
const express = require('express')

const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello from smarter speaker!'));

app.get('/search/actor', (req, res) => {
    let query = req.query.q
    moviedb.searchPerson({ query: query }).then(actorResult => {
        moviedb.discoverMovie({ 'with_people': actorResult.results[0].id }).then(movieResult => {
            res.send(movieResult.results[0].title);
        })
    }).catch(console.error);

});

app.listen(port, () => console.log(`Smarter speaker app listening on port ${port}!`))


