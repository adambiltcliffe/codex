# Game features implemented:

Shuffling initial hands for players
Decks and draw phase
Workers generating gold (limit 20)
Making new workers
Units
Base
Combat
Upkeep triggers
Arrival triggers
Attack triggers
Choice of order when adding triggers to queue
"Healing" keyword
Passive effects on units that modify their own/others' stats
Frenzy
Flying, anti-air
Patrol zone with taunt for squad leader and bonus for elite
Invisible (effects on attacking and patrolling)
Spell casting
Runes
Activated abilities

# Tests to write

Lookout slot provides resist
Bonus resist from lookout disappears when no longer patrolling
Invisible unit can't be targetted by opponent
Invisible unit can be targetted by controller
Trigger fizzles if the only available target is invisible
Spells/abilities must target flagbearer
Not required to target flagbearer if not a legal type
Not required to target flagbearer if can't pay for resist
Spark has to target patrolling flagbearer but not non-patrolling
Spells are put in discard pile after resolving
Spells are not in discard pile while resolving
Spells are put in discard pile before resolving triggers they caused

# Game features not implemented:

Other targetting modes for triggers
(Some of the) turn structure
One reshuffle per main phase limit

Patroller bonuses for technician, scavenger, lookout
Tech buildings
Building hp (other than base?)
Base damage from building destruction
Add-ons
Armor (requires effects)
Armor for squad leader
(More of) interaction of continuous effects
Swift strike, overpower, sparkshot (requires choosing targets)
Stealth, unstoppable
Invisible (effects on targetting)
Detector (requires invisible to be finished)
Tower (requires add-ons and detector)

Multicolour tax

Building cards and upgrade cards

Requirement to have tech buildings/unlocked specs to play units
Requirement to have right hero to cast spells

Hero(es)
Hero levels
Hero level up on death
Hero cooldown
Ultimate spell requirements

Codex and tech phase

# Other stuff to do

Make suggestActions do something sensible for patrollers
Figure out how to make triggers track their source when the ability isn't printed on the card
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground
