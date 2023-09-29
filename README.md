# Anilist: Hide Unwanted Activity

Customize activity feeds by removing unwanted entries.

## Features (Configurable)

- Remove activities containing custom strings
- Remove activities containing images
- Remove activities containing videos
- Remove activities with no comments
- Remove activities with no likes
- Load more activities until a minimum number is reached (configurable)
- Choose where the script should run (home feed, user profile feeds, social feeds)

## Installation

1. Install a user script manager extension for your browser (e.g., Violentmonkey, Tampermonkey).

2. Click [here](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.7/src/hideUncommentedActivity.user.js) to open the raw userscript file.

3. The userscript manager extension should detect the script and prompt you to install it. Follow the instructions to install the script.

## Configuration

Customize the script's behavior by editing the `config` object at the top of the script file. Below are the configuration options with their valid values:

- `targetLoadCount` (Default: `2`): Set a positive integer representing the minimum number of activities to display per click on the "Load More" button.
- `remove`:
  - `uncommented` (Default: `true`): Set to `true` to remove activities with no comments. Set to `false` to keep them.
  - `unliked` (Default: `false`): Set to `true` to remove activities with no likes. Set to `false` to keep them.
  - `images` (Default: `false`): Set to `true` to remove activities containing images. Set to `false` to keep them.
  - `videos` (Default: `false`): Set to `true` to remove activities containing videos. Set to `false` to keep them.
  - `customStrings` (Default: `[]`): Specify an array of strings that, if found in activities, will trigger their removal. For example, `['plans to watch', 'show-name']`. Leave it as an empty array `[]` if you don't want to use this feature.
  - `caseSensitive` (Default: `false`): Set to `true` for case-sensitive string removal. Set to `false` for case-insensitive removal.
- `runOn`:
  - `home` (Default: `true`): Set to `true` to run the script on the home feed. Set to `false` to exclude the home feed from processing.
  - `social` (Default: `true`): Set to `true` to run the script on social feeds. Set to `false` to exclude social feeds from processing.
  - `profile` (Default: `false`): Set to `true` to run the script on user profile feeds. Set to `false` to exclude profile feeds from processing.
- `linkedConditions` (Default: `[[]]`): Allows you to group conditions together. Activities are removed if they satisfy all conditions within a group. Linked conditions are always checked (even if the individual conditions are set to `false`).

Example usage (linkedConditions): `[['uncommented', 'unliked'], ['images', 'customStrings']]`

## Author

- [SeyTi01](https://github.com/SeyTi01)

## License

This project is licensed under the [MIT License](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.7/LICENSE).
