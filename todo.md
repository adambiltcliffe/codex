# Possible bugs to investigate

Unclear reporting of destroying own add-on
Order of items in log when sacrificing Harmony
sortBy is not defined in suggest.js:105 (targetMode.multiple? seen with Two Step/flagbearer)
Brick Thief reports nothing when no damage healed
Check that destroying your own add-on when your base has only 2hp makes you lose
Does checkStartAction check each player has a spec?

# Tests to write later

Long-range
Scorch and Fire Dart
Starting with right cards in codex, command zone and deck for 3-hero game
Spells are put in discard pile before resolving triggers they caused (need something with a death trigger)
Flying plus overpower and legal targets to redirect to (Void Star)
Sparkshot/overpower unit can't kill only additional patroller with SS and overpower to base (Blooming Elm)
Swift strike flying attacker can kill the SL it flew over and not get hit (needs unit with sparkshot+flying)
Flying plus stealth/invisible/unstoppable etc. and not taking AA damage if not using flying to evade
Declare an attack that destroys all possible attack targets with triggers (obliterate vs Lawbringer Gryphon)
Check stealth abilities vs tower still work correctly when retarget after initial target dies
Flyer with stealth/unstoppable abilities doesn't fly over AA units
Attacker with stealth and unstoppable still triggers tower (check this is right)
Dancer tokens don't flip if you stop the music while they're polymorphed or copying something
Units which sacrifice as a cost have the ability resolve before triggers (eg. bugblatter)
Triggers which must target some specific number of things >1 are skipped if unfulfillable (detector, resist)
Stealing half of a Two-Step partnership causes Two-Step to be sacrificed
When two new triggers arise halfway through a multi-step trigger, can queue them before continuing

# Other stuff to do

Write tests for suggest (particularly the non-exhaustive ones)
Tidy up the way making choices and queuing triggers is reported
Make damage reporting call out swift strike/overpower/sparkshot damage
Change signature of hasKeyword
Deprecate the use of getCurrentValues
Refactor getAttackableEntityIds into getAttackableEntities
Auto-resolve targetMode.multiple when there's only one valid combination
Move abilities/ out of cardinfo/ to untangle some imports
Simplify attack logic now we have entity.current.patrolSlot
Use a schema validation library to simplify action checking

# Cards that will need special attention (not in the roadmap)

Delayed Trigger:
. Desperation (Red/Blood)
. Bloodlust (Red/Blood)
. Vandy Anadrose (Black/Demonology)
. Death Rites (Black/Necromancy)
. Promise of Payment (Purple/Future)
Conditional stealth:
. Stalking Tiger (Green/Feral)
Heroes can't level up:
. Nether Drain (Black/Necromancy)
. Chronofixer (Purple/Present)
Choice of how to pay costs:
. Skeletal Lord (White/Necromancy)
. True Power of Storms (White/Discipline)
. Omegacron (Purple/Future)
Force sacrifice:
. Sacrifice the Weak (Black/starter)
Can't be sacrificed:
. Pestering Haunt (Black/starter)
Just generally weird interactions with everything:
. Gilded Glaxx (Purple/Future)
