const program = require('commander');
const chalk = require('chalk');
const axios = require('axios');
const _ = require('lodash');
const ora = require('ora');
const spinner = ora();
const player = require('play-sound')(opts = {});

program.version('0.1.0')
  .option('-r, --receiver [email]', 'The email of the Bonusly receiver (most times our own email)')
  .option('-b, --bonusly [access token]', 'The Bonusly access token')
  .option('-g, --github [access token]', 'The Github access token')
  .option('-d, --delay [seconds]', 'The delay between checks for new bonuses', 10000)
  .option('-m, --amount [bonusly]', 'The minimum amount of Bonusly (5 Bonusly = 1 EUR)', 5)
  .parse(process.argv);

if (!program.receiver || !program.bonusly || !program.github) {
    console.error(chalk.red('Please specify the receiver email and the Bonusly & Github access token.'));
    process.exit(1);
}

const delay = parseInt(program.delay);
const maxApprovalAttempts = 3;
const minAmount = parseInt(program.amount);
const cache = [];

function fetchBonuses() {
    process.stdout.write('\033c');
    spinner.start('Waiting for new bonuses...');

    axios.get('https://bonus.ly/api/v1/bonuses', {
        params: {
            'receiver_email': program.receiver,
            'access_token': program.bonusly,
            'limit': 1
        }
    }).then(function(response) {
        _.each(response.data.result, (bonus) => {
            if (-1 !== _.indexOf(cache, bonus.id)) {
              return;
            }

            cache.push(bonus.id);
            spinner.succeed('Found new bonuses...');

            let pattern = '.*?\/((?:[a-zA-Z0-9-_]+))\/((?:[a-zA-Z0-9-_]+))\/pull\/([0-9]{0,10})'
            let matches = new RegExp(pattern, ['i']).exec(bonus.reason);
            if (matches != null) {
                console.log(chalk.green('🤑  Found Github pull request URL: ' + bonus.reason));

                if (bonus.amount < minAmount) {
                    console.log(chalk.yellow(`${bonus.giver.display_name} was greedy and only gave ${bonus.amount} Bonusly instead of ${minAmount}. Skipping this one.`));

                    setTimeout(() => {
                        fetchBonuses();
                    }, delay);
                }

                setTimeout(() => {
                    approvePullRequest(matches[1], matches[2], matches[3]);
                }, delay);

                return;
            } else {
                console.log(chalk.blue('No Github pull request URL found. Skipping...'));

                setTimeout(() => {
                    fetchBonuses();
                }, delay);

                return;
            }
        });

        setTimeout(() => {
            fetchBonuses();
        }, delay);
    }).catch(function(error) {
        spinner.fail(error);

        setTimeout(() => {
            fetchBonuses();
        }, delay);
    });
}

function approvePullRequest(owner, repo, number, attempt) {
    let messages = ['Great work!', 'Very nice!  🙂', 'Excellent job!  👍', 'Love it!', 'Looks nice and clean!'];

    process.stdout.write('\033c');
    spinner.start(`Approving pull request: https://github.com/${owner}/${repo}/pull/${number}, Attempt #` + (attempt || 1));

    axios.post(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}/reviews?access_token=${program.github}`, {
        body: _.shuffle(messages)[0],
        event: 'APPROVE',
    }).then(function(response) {
        spinner.succeed('The pull request has been approved!   👍');

        player.play('cash.mp3', function(err){});

        setTimeout(() => {
            fetchBonuses();
        }, delay);
    }).catch(function(error) {
        spinner.fail(error);

        if (tries >= maxApprovalAttempts) {
            setTimeout(() => {
                fetchBonuses();
            }, delay);
        } else {
            setTimeout(() => {
                approvePullRequest(repo, number, attempt ? ++attempt : 1);
            }, delay);
        }
    });
}

fetchBonuses();