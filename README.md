# Approva.ly

Automatically approved Github pull requests which are sent along with a Bonus.ly bonus.

## Installation

    $ git clone git@github.com:jlis/approvaly.git approvaly
    $ cd approval
    $ yarn install

Instead of yarn you can also use NPM.

Also make sure you have MPlayer installed to avoid problems when playing the cash.mp3 sound.

    $ brew install mplayer


## Usage

    $ node index.js -r <your bonusly email> -b <your bonusly access token> -g <your github access token>

You can create your Bonusly access token [here](https://bonus.ly/api_keys/new) and your Github access token [here](https://github.com/settings/tokens/new).

**Pro tip:**

    $ node index.js --help

    For more options like the minimum Bonusly amount or the delay between checks for new bonuses.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT