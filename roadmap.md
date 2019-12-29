The initial public release of this library includes only the features needed to
play the introductory version of the game, i.e. the Bashing vs. Finesse
one-hero game. This means that some engine features have not yet been
implemented. This document details the plan for adding the remainder needed to
support the other eighteen specs and the three-hero game, prioritising those
which may require significant modifications to the engine to minimise the need
to modify existing cards.

## Engine features to support missing cards

Various ways that things can trigger when they damage/kill things:
. Gunpoint Taxman (Red/Anarchy)
. . triggerOnDamageEntity with isLethal==true (now done)
. Captain Zane (Red/Anarchy)
. . triggerOnDamageEntity with isLethal==true
. Firehouse (Red/Fire)
. . triggerOnDamageEntity with isLethal==true
. Shadow Blade (Black/Demonology)
. . Check in a second step of the ability resolution if the target died, to account for illusions etc. as well
. Cursed Crow (Black/Disease)
. . triggerOnDamageEntity
. Molting Firebird (Red/Fire)
. . triggerOnDamageEntity
. Might of Leaf and Claw
. . some different thing that also triggers when something else dealt damage

Now we have a single place where damage is dealt, prevention effects can modify it:
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
. Soul Stone (Black/Demonology)
. Brave Knight (Blue/Peace)
Note - fast triggers when units die are a different thing:
. Reteller of Truths (Blue/Truth)
. Graveyard (Black/starter)
. Second Chances (Purple/Past) (note - this needs to also replace bounce/trash)
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
