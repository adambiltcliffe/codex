# Game features implemented:

Shuffling initial hands for players
Decks and draw phase
Workers generating gold (limit 20)
Making new workers
Units
Combat
Upkeep triggers (with no choices required)
"Healing" keyword

# Tests to write

Starting the game
Ending turn, gaining gold in upkeep
Put units into play
Attack with a unit, check does die, doesn't die, etc.
Arrival fatigue
Units readying during upkeep (and reported)
Make a worker, get more gold in upkeep
Healing from helpful turtle, correct reporting of who healed
Star-Crossed Starlet dying after 2 turns
When implemented: choice of trigger ordering from SCS and HT

# Game features not implemented:

Choices during triggers
Queue ordering of triggers
(Most of the) turn structure
One reshuffle per main phase limit

Interaction of continuous effects

Combat abilities

Patrol zone

Tech buildings
Building hp
Base damage from building destruction
Add-ons
Multicolour tax

Hero(es)
Spell casting
Hero levels
Hero level up on death
Hero cooldown
Ultimate spell requirements

Codex and tech phase

# Other stuff to do

Use a schema validation library to simplify action checking
