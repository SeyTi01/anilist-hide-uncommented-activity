# Anilist: Hide Uncommented Activity

This is a userscript that hides uncommented/unliked activity on Anilist's activity feeds.

## Features

- Remove activities with no comments (optional)
- Remove activities with no likes (optional)
- Load more activities until a minimum number is reached (configurable)
- Choose where the script should run (home feed, user profile feeds, social feeds)

## Installation

1. Install a user script manager extension for your browser (e.g., Tampermonkey).

2. Click [here](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.5/src/hideUncommentedActivity.user.js) to open the raw userscript file.

3. The userscript manager extension should detect the script and prompt you to install it. Follow the instructions to install the script.

## Configuration

You can customize the script's behavior by editing the `config` object at the top of the script. The available options are:

- `targetLoadCount`: Set this to a positive integer that represents the minimum number of activities you want to see per click on the "Load More"-button. The default value is `2`.
- `remove`: Customize which activities to remove:
  - `uncommented`: Set this to `true` if you want to remove activities with no comments, or `false` if you want to keep them. The default value is `true`.
  - `unliked`: Set this to `true` if you want to remove activities with no likes, or `false` if you want to keep them. The default value is `false`.
- `runOn`: Choose where the script should run:
  - `home`: Set this to `true` if you want the script to run on the home feed. The default value is `true`.
  - `profile`: Set this to `true` if you want the script to run on user profile feeds. The default value is `true`.
  - `social`: Set this to `true` if you want the script to run on social feeds. The default value is `true`.

## Author

- [SeyTi01](https://github.com/SeyTi01)

## License

This project is licensed under the [MIT License](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.5/LICENSE).
