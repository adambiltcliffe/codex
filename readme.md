Rules engine for Codex by Sirlin Games

Still very much in development. For now, to get started, look at the documentation for [board-state](https://www.npmjs.com/package/board-state).

## Implementation notes (current):

As far as I'm aware everything should work according to the official rules.

## Implementation notes (prospective):

Master Midori and Behind the Ferns: the rulings page doesn't seem to give a
clear explanation of why Ferns beats Midori but only for units that arrive
later than both; it's possible we can get away with picking a different
implementation here.

Smoker and Dreamscape: this is the only case where multiple effects can occur
as a result of something becoming a target. Rather than add a whole separate
subsystem just for that, we may wish to just have the Illusion effect of
Dreamscape take priority automatically (which is probably what AP wants most
of the time.)

Focus Master: if multiple units or heroes would take exactly lethal damage at
the same time and Focus Master doesn't have enough focus runes to save them
all, we may wish to determine which ones to save at random (it's very strange
for AP to get to decide this).
