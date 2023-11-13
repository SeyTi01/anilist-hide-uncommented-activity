# Anilist: Hide Unwanted Activity

Customize activity feeds by removing unwanted entries.

## Features (Configurable)

- Filter and selectively include or exclude activities based on strings, images, videos, text, comments, or likes.
- Configure the script to run in specific locations such as home feeds, user profile feeds, or social feeds.
- Automatic loading of additional activities until a predefined minimum is achieved.

## Installation

1. Install a user script manager extension for your browser (e.g., Violentmonkey, Tampermonkey).

2. Click [here](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.8/src/hideUncommentedActivity.user.js) to open the raw userscript file.

3. The userscript manager extension should detect the script and prompt you to install it. Follow the instructions to install the script.

## Configuration

Customize the script's behavior by editing the `config` object at the top of the script file. Below are the configuration options with their valid values:

- `remove`:
  - `uncommented` (Default: `true`): Set to `true` to remove activities that have no comments. Set to `false` to keep them.
  - `unliked` (Default: `false`): Set to `true` to remove activities that have no likes. Set to `false` to keep them.
  - `text` (Default: `false`): Set to `true` to remove activities containing only text. Set to `false` to keep them.
  - `images` (Default: `false`): Set to `true` to remove activities containing images. Set to `false` to keep them.
  - `videos` (Default: `false`): Set to `true` to remove activities containing videos. Set to `false` to keep them.
  - `containsStrings` (Default: `[]`): Remove activities containing user-defined strings. For example, `['plans to watch', 'show-name']`. Leave it as an empty array `[]` if you don't want to use this feature.

- `options`:
  - `targetLoadCount` (Default: `2`): Set a positive integer representing the minimum number of activities to display per click on the "Load More" button.
  - `caseSensitive` (Default: `false`): Set to `true` for case-sensitive string removal. Set to `false` for case-insensitive removal.
  - `reversedConditions` (Default: `false`): Set to `true` to only keep posts that would be removed by the conditions.
  - `linkedConditions` (Default: `[]`): Groups of conditions to be checked together. Linked conditions are always considered 'true'.

- `runOn`:
  - `home` (Default: `true`): Set to `true` to run the script on the home feed. Set to `false` to exclude the home feed from processing.
  - `social` (Default: `true`): Set to `true` to run the script on social feeds. Set to `false` to exclude social feeds from processing.
  - `profile` (Default: `false`): Set to `true` to run the script on user profile feeds. Set to `false` to exclude profile feeds from processing.

## Additional information

Both `containsStrings` and `linkedConditions` support regular arrays `[]` as well as two-dimensional arrays `[[]]`.
When utilizing two-dimensional arrays, conditions/strings within the inner arrays are evaluated together:

- `['A', 'B']` removes entries containing either 'A' or 'B'.
- `[['A', 'B']]` removes entries containing both 'A' and 'B'.
- `[['A', 'B'], ['C', 'D']]` removes entries containing either both 'A' and 'B' or both 'C' and 'D'.

## Example usages

- `options.linkedConditions: [['images', 'customStrings'], ['uncommented', 'unliked']]`: 
  - Remove activities containing either both images and specific strings, or neither comments nor likes.
- `options.reversedConditions = true`, `remove.images = true`: 
  - Remove all activities except those containing images.

## Editing the config object

Editing User Script Files in Violentmonkey

1. Open the Violentmonkey extension in your browser.
2. Click on the dashboard button.
3. Click on the Edit (`</>`) button below the script.
4. Make the necessary changes to the script.
5. Click on the Save button to save the changes.

## Author

- [SeyTi01](https://github.com/SeyTi01)

## License

This project is licensed under the [MIT License](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.8/LICENSE).