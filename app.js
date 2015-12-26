/*****
 * Calculates the total points for each position by analyzing the weekly results exports downloaded by
 * 'downloader.js'.  
 */

var chalk = require('chalk'),
    fs = require('fs')

var getAllFilesFromFolder = function(dir) {

    var results = [];
    fs.readdirSync(dir).forEach(function(file) {

        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesFromFolder(file))
        } else {
            results.push(file);
        }
    });

    return results;
};

console.log(chalk.cyan('Starting Weekly Results Calculation...'));


var playerArray = JSON.parse(fs.readFileSync('players.json', 'utf8')).players.player;

var positionScores = {};


// THERE HAS ***GOT***** TO BE A BETTER WAY TO DO THIS.


var allFiles = getAllFilesFromFolder('results/');
allFiles.forEach( function (fileName) {

    console.log("Processing ", chalk.green(fileName));

    if (fileName.indexOf('.json') > -1) {

        var weeklyResults = JSON.parse(fs.readFileSync(fileName, 'utf-8')).weeklyResults;
        weeklyResults.matchup.forEach( function (matchup) {
            matchup.franchise.forEach( function (franchise) {

                if (franchise.player) {
                    franchise.player.forEach( function (player) {

                        if (player.status === 'starter') {

                            playerArray.forEach ( function (playerArrayPlayer)  {

                                // player scores of '0' do not seem to be reported under some circumstances ( DNP? ).  Need to weed those out first.
                                if (player.score && playerArrayPlayer.id === player.id) {

                                    //console.log('Adding ' + playerArrayPlayer.name + '\'s score of ' + player.score + ' to ' + playerArrayPlayer.position + ' total.');

                                    if (positionScores[playerArrayPlayer.position]) {
                                        positionScores[playerArrayPlayer.position] = positionScores[playerArrayPlayer.position] + parseFloat(player.score);
                                        //console.log('Added ' + player.score + ' to ' + playerArrayPlayer.position + ' total.  Now is ' + positionScores[playerArrayPlayer.position]);
                                    } else {
                                        positionScores[playerArrayPlayer.position] = parseFloat(player.score);
                                        //console.log('Created new entry for ' + playerArrayPlayer.position + ' total.  Now is ' + positionScores[playerArrayPlayer.position]);
                                    }
                                }
                            });
                        }
                    })
                }
            })
        })
    }

});


console.log("Final results are : %j", positionScores);
