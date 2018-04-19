/**
 * Package imports
 */
const dotenv = require("dotenv").config();
const keys = require('./keys.js');
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const inquirer = require('inquirer');
const request = require('request');
const colors = require('colors');
const fs = require('fs');

const log4js = require('log4js');

log4js.configure({
  appenders: { Liri: { type: 'file', filename: 'app.log' }},
  categories: { default: { appenders: ['Liri'], level: 'info' } }});

const logger = log4js.getLogger('Liri');

/**
 * Setting up credentials for Twitter
 */
const client = new Twitter({
  consumer_key: keys.twitter.consumer_key,
  consumer_secret: keys.twitter.consumer_secret,
  access_token_key: keys.twitter.access_token_key,
  access_token_secret: keys.twitter.access_token_secret
});

/**
 * Setting up credentials for Spotify
 */
const spotify = new Spotify({
  id: keys.spotify.id,
  secret: keys.spotify.secret
});

/**
 * Initial question that would appear when user starts the program.
 */
const initialOption = {
  type: 'list',
  name: 'searchCriteria',
  message: 'Select Your Search Option',
  choices: ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says']
};

/**
 * Takes movie input that user wants to search in OMDB.
 */
const movieSearchOption = {
  type: 'input',
  name: 'movie',
  message: 'Which movie should I search for ?'
};

/**
 * Takes song input that user wants to search in Spotify.
 */
const songSearchOption = {
  type: 'input',
  name: 'song',
  message: 'Which song should I search for ?'
};

/**
 * Initil Question prompt that would ask user to select for search option
 */
inquirer.prompt([initialOption]).then(answers => {

  switch (answers.searchCriteria) {

    /**
     * When user wants to search for his tweets
     */
    case 'my-tweets':
      searchTweets();
      break;

    /**
     * When user wants to search for song
     */
    case 'spotify-this-song':
      inquirer.prompt([songSearchOption]).then(answers => {
        answers.song === '' ? searchSpotify("The Sign - Ace of Base") : searchSpotify(answers.song);
      });
      break;

    /**
     * When user wants to search for a movie
     */
    case 'movie-this':
      inquirer.prompt([movieSearchOption]).then(answers => {
        answers.movie === '' ? searchForMovie("Mr. Nobody.") : searchForMovie(answers.movie);
      });
      break;

    /**
    * Reads a random text file and search for a song in spotify 
    */
    case 'do-what-it-says':
      fs.readFile('random.txt', 'utf8', (err, data) => {
        searchSpotify(data.split(",")[1]);
      });
      break;

    /**
     * Default
     */
    default:
      logger.info("No right option");
  }
});

/**
 * Search for the most recent 20 tweets and console log the information on the screen
 */
const searchTweets = function () {
  client.get('favorites/list', function (error, tweets, response) {
    if (error) throw colors.red(JSON.stringify(error));
    
    logger.info("**************************************************************************");
    console.log(colors.cyan("**************************************************************************"));
    
    tweets.forEach(tweet => {

      // Logging to the log file
      logger.info("-----------");
      logger.info(tweet.text);
      logger.info(tweet.user.description);
      logger.info("-----------");
      
      // Console log
      console.log(colors.blue("-----------"));
      console.info(colors.magenta(tweet.text));
      console.info(colors.green(tweet.user.description));
      console.info(colors.blue("-----------"));
    });

    logger.info("**************************************************************************");
    console.log(colors.cyan("**************************************************************************"));
  
  });
};

/**
 * Search for the song in spotify and console log the information on the screen
 *  @param {*} song
 */
const searchSpotify = function (song) {
  spotify
    .search({
      type: 'track',
      query: song
    })
    .then(response => {
      
      logger.info("**************************************************************************");
      logger.info("Song Name: ", response.tracks.items[0].name);
      logger.info("Album Name: ", response.tracks.items[0].album.name);
      logger.info("Artist Name: ", response.tracks.items[0].album.artists[0].name);
      logger.info("Spotify Link: ", response.tracks.items[0].external_urls.spotify);
      logger.info("**************************************************************************");
      
      console.log(colors.cyan("**************************************************************************"));
      console.log(colors.magenta("Song Name: "), colors.green(response.tracks.items[0].name));
      console.log(colors.magenta("Album Name: "), colors.green(response.tracks.items[0].album.name));
      console.log(colors.magenta("Artist Name: "), colors.green(response.tracks.items[0].album.artists[0].name));
      console.log(colors.magenta("Spotify Link: "), colors.green(response.tracks.items[0].external_urls.spotify));
      console.log(colors.cyan("**************************************************************************"));
    })
    .catch(err => {
      logger.info(colors.red(err));
    });
};

/**
 * 
 * @param {*} movie 
 */
const searchForMovie = function (movie) {
  let url = "http://www.omdbapi.com/";
  let key = "trilogy";
  let requestURL = `${url}?apikey=${key}&t=${movie}`;
  request(requestURL, function (error, response, body) {
    
    // Logging into the file
    logger.info(("**************************************************************************"));
    logger.info("Title: ", JSON.parse(body)["Title"]);
    logger.info("Year: ", JSON.parse(body)["Year"]);
    logger.info("IMDB Rating: ", JSON.parse(body)["imdbRating"]);
    logger.info("Rotten Tomatoes Rating: ", JSON.parse(body)["Ratings"][1].Value ? JSON.parse(body)["Ratings"][1].Value : "N/A");
    logger.info("Country: ", JSON.parse(body)["Country"]);
    logger.info("Language: ", JSON.parse(body)["Language"]);
    logger.info("Plot: ", JSON.parse(body)["Plot"]);
    logger.info("Actors: ", JSON.parse(body)["Actors"]);
    logger.info("**************************************************************************");

    // Logging on the console
    console.log(colors.cyan("**************************************************************************"));
    console.log(colors.magenta("Title: "), colors.green(JSON.parse(body)["Title"]));
    console.log(colors.magenta("Year: "), colors.green(JSON.parse(body)["Year"]));
    console.log(colors.magenta("IMDB Rating: "), colors.green(JSON.parse(body)["imdbRating"]));
    console.log(colors.magenta("Rotten Tomatoes Rating: "), colors.green(JSON.parse(body)["Ratings"][1].Value ? JSON.parse(body)["Ratings"][1].Value : "N/A"));
    console.log(colors.magenta("Country: "), colors.green(JSON.parse(body)["Country"]));
    console.log(colors.magenta("Language: "), colors.green(JSON.parse(body)["Language"]));
    console.log(colors.magenta("Plot: "), colors.green(JSON.parse(body)["Plot"]));
    console.log(colors.magenta("Actors: "), colors.green(JSON.parse(body)["Actors"]));
    console.log(colors.cyan("**************************************************************************"));
  });
};