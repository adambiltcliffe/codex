# Game features implemented:

Shuffling initial hands for players
Decks and draw phase
Workers generating gold (limit 20)
Making new workers
Units
Base
Combat
Upkeep triggers (with up to one target)
Arrival triggers (with up to one target)
Choice of order when adding triggers to queue
"Healing" keyword
Passive effects on units that modify their own/others' stats
Frenzy
Flying
Patrol zone

# Write tests for:

Nimble fencer not buffing opponent's units
Grounded Guide not buffing opponent's units
Flyer can attack past non-flying squad leader and other patrollers
Flyer can attack past non-flying squad leader but not flying patrollers
Flyer can attack non-flying squad leader even when other patrollers have flying
Non-flying units can attack past flying patrollers
Non-flying units can't attack flying ones whatever slot they're in
Flying unit attacking non-flying unit does not take damage

# Game features not implemented:

More sophisticated choices/targets during triggers
(Some of the) turn structure
One reshuffle per main phase limit

Tech buildings
Building hp (other than base?)
Base damage from building destruction
Add-ons
Patroller bonuses
(More of) interaction of continuous effects
Swift strike, overpower, sparkshot (requires choosing targets)
Stealth, unstoppable (requires patrol zone)
Invisible, detector (requires targets and patrol zone)
Tower (requires add-ons and detector)

Multicolour tax

Building cards and upgrade cards

Hero(es)
Spell casting
Hero levels
Hero level up on death
Hero cooldown
Ultimate spell requirements

Codex and tech phase

# Other stuff to do

Get rid of "\${player1} readies base" on first turn
Find out why suggestActions isn't suggesting attacks any more
Make suggestActions do something sensible for patrollers
Figure out how to make triggers track their source when the ability isn't printed on the card
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground
