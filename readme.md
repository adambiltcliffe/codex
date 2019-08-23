# Game features implemented:

Decks and drawing cards
Workers generating gold, making new workers
Units
Base
Combat
Heroes
Tech buildings and add-ons with base damage when they die
Ability to level up heroes
Upkeep/arrival/attack triggers
Activated abilities
Choice of order when adding triggers to queue
Automatic resolution of triggers when only one choice exists and skipping if none
Passive effects on units: modify own/others' stats, add abilities, modify costs to play cards
Frenzy, haste, flying, anti-air, invisible, healing, resist, overpower, sparkshot, readiness, stealth
Patrol zone with bonuses for squad leader, elite, scavenger, technician and lookout
Spell casting including checking if you have the right hero and ultimate spells
Flagbearer ability
+1/+1 and -1/-1 runes
Effects that last for the current turn

# Tests to write

Requirement for tech buildings to play units
Blademaster: other units have swift strike
Blademaster: after it dies, other units lose swift strike
Blademaster: if it dies when defending without killing attacker, other units don't deal damage twice
Trojan Duck: obliterate 2 units
Trojan Duck: attack trigger can damage building
Trojan Duck: if kill attack target with trigger, choose new one
Final Smash: if no tech 0 unit exists, can still do the tech 1 and 2 bits
Final Smash: if 2 targets for each tech level, have to choose for each
Final Smash: if only one choice for tech 0 and tech 2, still choose tech 1
Stealth unit can't attack backline if tower has unused detector
Stealth unit can't attack backline if tower detected it previously
Stealth unit can attack backline if tower has used detector

# Tests to write later

\*Unstoppable
Long-range
Scorch and Fire Dart
Spells are put in discard pile before resolving triggers they caused (need something with a death trigger)
Flying plus overpower and legal targets to redirect to (Void Star)
Sparkshot/overpower unit can't kill only additional patroller with SS and overpower to base (Blooming Elm)
Swift strike flying attacker can kill the SL it flew over and not get hit (needs unit with sparkshot+flying)
Flying plus stealth/invisible/unstoppable etc. and not taking AA damage if not using flying to evade
Declare an attack that destroys all possible attack targets with triggers (obliterate vs Lawbringer Gryphon)
Check stealth abilities vs tower still work correctly when retarget after initial target dies
Flyer with stealth abilities doesn't fly over AA units

# Game features not implemented:

Modal choice on spell resolution (> Appel Stomp)
Replacement card destination after spell resolution (> Appel Stomp)
Ongoing spell & channelling (> Harmony)
Tokens (> Harmony)
When-you-play trigger (> Harmony)
Two targets (> Two-step)
State trigger (> Two-step)

Temporary detection by tower on own turn

Avoid leaking minor information when workering
Codex and tech phase
Victory condition

# Game features not implemented, not needed for BvF:

One reshuffle per main phase limit

Multicolour tax
Proper continuous effects ordering
Building cards and upgrade cards

Simultaneous hero limit
Choice of tech specs to unlock and requirement to unlock right spec to play cards
Tech Lab and Heroes' Hall

Unstoppable, long-range, two lives, deathtouch, other abilities
Permanent detector
Damage modification effects

Sparkshot stacking
Make Flagbearer not an ability (to support Vortoss Emblem)

Make hero level up on death happen faster than other death triggers

# Other stuff to do

Tidy up the way making choices and queuing triggers is reported
Make damage reporting call out swift strike/overpower/sparkshot damage
Rewrite the core loop in CodexGame.updateState as an FSM or other better way
Change signature of hasKeyword
Deprecate the use of getCurrentValues
Refactor getAttackableEntityIds into getAttackableEntities
Move suggest into a module and write tests for it
Add suggestions for building fixtures
Move abilities/ out of cardinfo/ to untangle some imports
Store 'patrolSlot' in entity.current to simplify attack logic
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground

# Cards that will need special attention

Hotter Fire (Red/Fire)
Master Midori (Green/Balance)
Stalking Tiger (Green/Feral)
Rampaging Elephant (Green/Feral)
Polymorph: Squirrel (Green/Growth)
Manufactured Truth (Blue/starter)
Jail (Blue/starter)
Reteller of Truths (Blue/Truth)
Dreamscape (Blue/Truth)
Graveyard (Black/starter)
Soul Stone (Black/Demonology)
Smoker (White/starter)
Second Chances (Purple/Past)
Gilded Glaxx (Purple/Future)
