The initial public release of this library includes only the features needed to
play the introductory version of the game, i.e. the Bashing vs. Finesse
one-hero game. This means that some engine features have not yet been
implemented. This document details the plan for adding the remainder needed to
support the other eighteen specs and the three-hero game, prioritising those
which may require significant modifications to the engine to minimise the need
to modify existing cards.

## Engine features to support missing cards

Make a function for exhausting entities rather than just setting ready=false
so that abilities can trigger when something becomes exhausted:
. Rampaging Elephant (Green/Feral)
Add a source to damage-dealing events so that things can trigger on killing
another unit:
. Captain Zane (Red/Anarchy)
. Gunpoint Taxman (Red/Anarchy)
. Firehouse (Red/Fire)
. Shadow Blade (Black/Demonology)
Instead of actions dealing damage directly, have them add to a list of pending
damage packets so that effects can replace damage before it's dealt:
. Focus Master (White/Discipline)
. Morningstar Pass (White/Strength)
. Sentry (Purple/Present)
. Blackhand Dozer (Black/Demonology)
Add a way for abilities to modify amount of damage being dealt (needs to be
before the packet is created, because of how it interacts with abilities that
divde damage between multiple targets):
. Hotter Fire (Red/Fire)
Add a damage-division target mode:
. Ember Sparks (Red/Fire)
. Burning Volley (Red/Fire)
Add a list for pending destruction of entities so that that can be replaced as
well:
. Reteller of Truths (Blue/Truth)
. Graveyard (Black/starter)
. Soul Stone (Black/Demonology)
. Second Chances (Purple/Past)
. Brave Knight (Blue/Peace)
Rewrite the "apply continuous effects" logic to allow modifying printed values
or copying those of other entities before applying everything else:
. Polymorph: Squirrel (Green/Growth)
. Manufactured Truth (Blue/starter)
. Chaos Mirror (Red/Anarchy)
Add rules for legendary units, including when things become a copy of a legend
or legends become a copy of something else:
. Galina Glimmer (Green/Growth)
. Jandra, the Negator (Black/starter)
Set up a way to control the order in which continuous effects are applied so
that the ones which are conditional on others can be applied last:
. Master Midori (Green/Balance)
. Behind the Ferns (Green/Feral)
. Wandering Mimic (Green/Balance)
. Fox's Den School (White/Ninjutsu)
. Jade Fox, Den's Headmistress (White/Ninjutsu)
Allow triggers to modify arriving units or make them go somewhere else:
. Drakk Ramhorn
. Jail (Blue/starter)
Allow abilities to trigger when something becomes a target (it should be
possible to put the trigger back into the queue with the target specified and
move the new trigger in front of it):
. Dreamscape (Blue/Truth)
. All Illusions (Blue/starter and Truth)
. Smoker (White/starter)

## Engine features to support the three-hero game

. One reshuffle per main phase limit
. Choice of tech specs to unlock when you build Tech II building and
requirement to have the right spec unlocked to play cards
. Multicolour tax for multicolour decks
. Enforce the simultaneous hero limit
. Implement Tech Lab and Heroes' Hall
. Make sparkshot stack (in BvF there's no way for a unit to gain multiple
instances of it)
. Make Flagbearer not an ability (to support Vortoss Emblem)
. Make hero level up on death happen faster than other death triggers
. Add a targeting mode for choosing an opponent (update Discord to target a
single opponent in case we ever formally support three or more players)
