# Game features implemented:

Shuffling initial hands for players
Decks and draw phase
Workers generating gold (limit 20)
Making new workers
Units
Combat
Upkeep triggers (with no choices required)
Choice of order when adding triggers to queue
"Healing" keyword

# Tests to write

Arrival fatigue (easiest to add when attacking base is implemented)

# Game features not implemented:

Choices during triggers
(Some of the) turn structure
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

Move code into a /src/ folder
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground
