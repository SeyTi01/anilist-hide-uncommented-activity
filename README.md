# Anilist: Hide Uncommented Activity

This is a userscript that hides uncommented/unliked activity on the Anilist social-feed.

## Features

- Remove activities with no comments (optional)
- Remove activities with no likes (optional)
- Load more activities until a minimum number is reached (configurable)

## Installation

1. Install a userscript manager extension for your browser (e.g., Tampermonkey).
2. Click [here](https://github.com/SeyTi01/anilist-hide-uncommented-activity/raw/1.0/src/hideUncommentedActivity.user.js) to open the raw userscript file.
3. The userscript manager extension should detect the script and prompt you to install it. Follow the instructions to install the script.

**Note**: You need to refresh the page when you open a show's social feed for the script to work properly.

## Configuration

You can customize the script's behavior by editing the `config` object at the top of the script. The available options are:

- `removeUncommented`: Set this to `true` if you want to remove activities with no comments, or `false` if you want to keep them. The default value is `true`.
- `removeUnliked`: Set this to `true` if you want to remove activities with no likes, or `false` if you want to keep them. The default value is `false`.
- `targetLoadCount`: Set this to a positive integer that represents the minimum number of activities you want to see per click on the "Load More"-button. The default value is `2`.

## Author

- [SeyTi01](https://github.com/SeyTi01)

## License

This project is licensed under the [MIT License](https://github.com/SeyTi01/new-reddit-spoiler-preview-fix/raw/1.5/LICENSE).