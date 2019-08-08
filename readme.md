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
Automatic resolution of triggers when only one choice exists and skipping if none
Passive effects on units: modify own/others' stats, add abilities, modify costs to play cards
Frenzy, haste, flying, anti-air, invisible, healing, resist, overpower, sparkshot, readiness
Patrol zone with bonuses for squad leader, elite, scavenger, technician and lookout
Spell casting including checking if you have the right hero
Flagbearer ability
+1/+1 and -1/-1 runes
Effects that last for the current turn

# Tests to write

River abilities
Everything involving swift strike and sparkshot
Combinations of swift strike and sparkshot
Combinations of sparkshot and overpower
Overpower prompts only when needed
Skipping triggers with no choices
Everything about Trojan Duck

# Tests to write later

Scorch and Fire Dart
Spells are put in discard pile before resolving triggers they caused (need something with a death trigger)
Put back deleted Brick Thief tests when more than 2 buildings can exist
Flying plus overpower and legal targets to redirect to (Void Star)

# Game features not implemented:

Obliterate
Retarget attack if original target dies (do once sparkshot and overpower tests written)

One reshuffle per main phase limit

Heroes go on cooldown when killed

Tech buildings and add-ons
Base damage from building destruction
Stealth
Surplus (requires add-ons)
Tower (requires add-ons)
Temporary detection by tower
Requirement to have tech buildings/unlocked specs to play units

Hero level up on death
Hero cooldown
Ultimate spell requirements

Avoid leaking minor information when workering
Codex and tech phase

Victory condition

# Game features not implemented, not needed for BvF:

Multicolour tax
Proper continuous effects ordering
Building cards and upgrade cards

Tech Lab and Heroes' Hall

Unstoppable, long-range, two lives, deathtouch, other abilities
Permanent detector
Damage modification effects

Sparkshot stacking

# Other stuff to do

Make damage reporting call out swift strike/overpower/sparkshot damage
Rewrite the core loop in CodexGame.updateState as an FSM
Fix inconsistent ordering of prompts and attack message depending on whether attacker has swift strike
Change signature of hasKeyword
Deprecate the use of getCurrentValues
Refactor getAttackableEntityIds into getAttackableEntities
Move the first three tests from neutral.test.js into a keyword test file
Move suggest into a module and write tests for it
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground

# Cards that will need special attention

Hotter Fire (Red/Fire)
Master Midori (Green/Balance)
Manufactured Truth (Blue/starter)
Jail (Blue/starter)
Reteller of Truths (Blue/Truth)
Dreamscape (Blue/Truth)
Graveyard (Black/starter)
Soul Stone (Black/Demonology)
Smoker (White/starter)
Second Chances (Purple/Past)
Gilded Glaxx (Purple/Future)
