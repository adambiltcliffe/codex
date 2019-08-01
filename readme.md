# Game features implemented:

Decks and drawing cards
Workers generating gold, making new workers
Units
Base
Combat
Heroes
Ability to level up heroes
Upkeep/arrival/attack triggers
Activated abilities
Choice of order when adding triggers to queue
Passive effects on units that modify their own/others' stats and add abilities
Frenzy, haste, flying, anti-air, invisible, healing, resist
Patrol zone with taunt for squad leader and bonus for elite and scavenger
Spell casting
Flagbearer ability
+1/+1 and -1/-1 runes

# Tests to write

Troq abilities
Lookout slot provides resist (to do)
Bonus resist from lookout disappears when no longer patrolling (to do)
Technician trigger (to do)
Scavenger trigger
Spells/abilities must target flagbearer
Not required to target flagbearer if not a legal type
Not required to target flagbearer if can't pay for resist
Spark has to target patrolling flagbearer but not non-patrolling
Spells are put in discard pile after resolving
Spells are not in discard pile while resolving
Spells are put in discard pile before resolving triggers they caused

# Game features not implemented:

One reshuffle per main phase limit
Don't lock the game if a trigger has no available targets
Auto-target if there is only one available target

Heroes return to command zone and go on cooldown when killed

Patroller bonuses for technician, lookout
Tech buildings
Building hp (other than base?)
Base damage from building destruction
Add-ons
Armor (requires effects)
Armor for squad leader
(More of) interaction of continuous effects
Swift strike, overpower, sparkshot (requires choosing targets)
Stealth, unstoppable
Detector (requires stealth)
Tower (requires add-ons and detector)

Multicolour tax

Building cards and upgrade cards

Requirement to have tech buildings/unlocked specs to play units
Requirement to have right hero to cast spells

Hero level up on death
Hero cooldown
Ultimate spell requirements

Avoid leaking minor information when workering
Codex and tech phase

Victory condition

# Other stuff to do

Make sure state-based actions are checked at all appropriate times
Move the first three tests from neutral.test.js into a keyword test file
Make suggestActions do something sensible for patrollers
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground
