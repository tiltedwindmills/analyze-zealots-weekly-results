/*****
 * 
 * Downloads a weekly results file from MFL, assuming its not available already.  Will probably need to
 * run this more than once as the MFL connect will fail when it gets overloaded.
 *
 */

var chalk = require('chalk'),
    fs = require('fs'),
    request = require('request')


console.log(chalk.cyan('Starting Weekly Results Download...'));

/*
var obj = JSON.parse(fs.readFileSync('results/z1-week1.json', 'utf8'));
console.log('Length is %s', obj.weeklyResults.matchup.length);
*/

var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('leagues_2015.txt')
});

var resultCount = 0;

var getResults = function(leagueName, leagueId, week) {

    var fileName = 'results/z' + leagueName + 'week' + week + '.json';

    try {
        fs.lstatSync(fileName);
        //console.log(chalk.green('Found existing file for week ' + week + ' data for Zealots ' + leagueName + ' to file ' + fileName));
        return;

    // lstatSync fails if no file, so this is just a stupid way to handle this logic
    } catch (e) { }


    var file = fs.createWriteStream(fileName);

    request
        .get({
            url : 'http://football.myfantasyleague.com/2015/export',
            qs :  {
                TYPE : 'weeklyResults',
                JSON : '1',
                L : leagueId, 
                W : week
            }})
        .on('response', function (response) {
            //console.log(chalk.green('Downloaded week ' + week + ' data for Zealots ' + leagueName + ' to file ' + fileName));
            resultCount++;
        })
        .on('error', function (err) {
            console.log(chalk.red('Download FAILED for week ' + week + ' data for Zealots ' + leagueName + ' -- ' + err));
        })
        .pipe(fs.createWriteStream(fileName));
};


lineReader.on('line', function (line) {

    var regex = /(.*) - (\d{5})/;
    var match = regex.exec(line);

    for (var i = 1; i <= 13; i++) {
        getResults(match[1], match[2], i);
    }
});
