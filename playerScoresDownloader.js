/*****
 * Similar to 'downloader.js' for Weekly Results downloads, this script downloads the player scores 
 * ( top performers ) export for multiple positions for multiple weeks.
 */

var chalk = require('chalk'),
    fs = require('fs'),
    request = require('request')


console.log(chalk.cyan('Starting Player Scores Download...'));
var resultCount = 0;


var getScores = function(position, week) {

    var filePosition = position;
    if (position == 'DT%2BDE') filePosition = 'DL';
    if (position == 'CB%2BS') filePosition = 'DB';

    var fileName = 'scores/' + filePosition + '_week' + week + '.json';

    try {
        fs.lstatSync(fileName);
        //console.log(chalk.green('Found existing file for week ' + week + ' data for Zealots ' + leagueName + ' to file ' + fileName));
        return;

    // lstatSync fails if no file, so this is just a stupid way to handle this logic
    } catch (e) { }


    var file = fs.createWriteStream(fileName);

    var someRandomZealotsLeagueId = 12106;

    request
        .get({
            url : 'http://football.myfantasyleague.com/2015/export',
            qs :  {
                TYPE : 'playerScores',
                JSON : '1',
                L : someRandomZealotsLeagueId,
                POSITION : position, 
                W : week
            }})
        .on('response', function (response) {
            console.log(chalk.green('Downloaded week ' + week + ' data for ' + position + ' to file ' + fileName + ' -- ' + JSON.stringify(response, null, 4)));
            resultCount++;
        })
        .on('error', function (err) {
            console.log(chalk.red('Download FAILED for week ' + week + ' data for Zealots ' + leagueName + ' -- ' + err));
        })
        .pipe(fs.createWriteStream(fileName));
};


//var positions = [ 'QB', 'RB', 'WR', 'TE', 'PK', 'DT%2BDE', 'LB', 'CB%2BS' ];
var positions = [ 'QB', 'RB', 'WR', 'TE', 'PK', 'DT+DE', 'LB', 'CB+S' ];
positions.forEach( function(position) {
    for (var i = 1; i <= 13; i++) {
        console.log("Getting scores for %s week %s", position, i);
        getScores(position, i);
    }
});
