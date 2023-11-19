# Changelog

## Version 1.8.1 (Nov 19, 2023)

### Fixes
- Resolved an issue with linkedConditions not behaving correctly when the array includes both strings and arrays.
- Fixed a bug where linkedConditions were not functioning correctly when reverseConditions were enabled, along with other conditions.

### Changes
- Changed name and description.
- Changed the order of remove conditions in config.

## Version 1.8 (Nov 14, 2023)

### Features
- Added filter for activities containing only text
- Added option to reverse filter conditions
- containsStrings now supports two-dimensional arrays

### Changes
- Restructured the configuration object

## Version 1.7 (Sep 29, 2023)

### Features
- Remove activities containing images
- Remove activities containing videos
- Specify groups of conditions to be checked together

## Version 1.6 (Sep 20, 2023)

### Features
- Added an option to remove activities containing custom strings
- Fixed the issue where the cancel button appeared when it wasn't supposed to

## Version 1.5 (Sep 18, 2023)

### Features
- Configure the feeds on which the script should run

### Changes
- Fixed null calls on the home feed

## Version 1.4 (Sep 16, 2023)

### Features
- Added config validation

## Version 1.3 (Sep 15, 2023)

### Features
- Added a "Cancel" button to stop loading more activities
- Updated to work on all activity feeds on the site

## Version 1.2 (Sep 14, 2023)

### Features
- Added a feature to automatically trigger DOM events when the site stops loading new elements, eliminating the need for user input until the targetLoadCount of entries is reached

## Version 1.1 (Sep 14, 2023)

### Changes
- Matched URL to also apply to manga

## Version 1.0 (Sep 13, 2023)

### Features
- Remove activities with no comments (optional)
- Remove activities with no likes (optional)
- Load more activities until a minimum number is reached (configurable)

### Notes
- Users are required to refresh the page when opening a show's social feed for the script to work properly.