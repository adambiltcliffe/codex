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
Passive effects on units that modify their own stats
Frenzy

# Tests to write

Arrival fatigue (easiest to add when attacking base is implemented)
Haste on Timely Messenger (ditto)

# Game features not implemented:

Choices/targets during triggers
(Some of the) turn structure
One reshuffle per main phase limit

Base
Tech buildings
Building hp
Base damage from building destruction
Add-ons
Patrol zone
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

Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground
