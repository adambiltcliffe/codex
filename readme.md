Rules engine for Codex by Sirlin Games

Still very much in development. For now, to get started, look at the documentation for [board-state](https://www.npmjs.com/package/board-state).

## Implementation notes (prospective):

Focus Master: if multiple units or heroes would take exactly lethal damage at
the same time and Focus Master doesn't have enough focus runes to save them
all, we may wish to determine which ones to save at random (it's very strange
for AP to get to decide this).
