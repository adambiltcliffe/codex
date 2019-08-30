Multiple targets: triggers/canResolveCurrentTrigger

# Two Step tests

Combinations including one or more flagbearers

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

# Game features not implemented:

Two targets (> Two-step)
State trigger (> Two-step)

# Game features not implemented, not needed for BvF:

One reshuffle per main phase limit

Multicolour tax
Proper continuous effects ordering
Building cards and upgrade cards

Simultaneous hero limit
Choice of tech specs to unlock and requirement to unlock right spec to play cards
Tech Lab and Heroes' Hall

Long-range, two lives, deathtouch, other abilities
Permanent detector
Damage modification effects

Sparkshot stacking
Make Flagbearer not an ability (to support Vortoss Emblem)

Make hero level up on death happen faster than other death triggers

Choosing an opponent (update Discord)

# Other stuff to do

Tidy up the way making choices and queuing triggers is reported
Make damage reporting call out swift strike/overpower/sparkshot damage
Rewrite the core loop in CodexGame.updateState as an FSM or other better way
Change signature of hasKeyword
Deprecate the use of getCurrentValues
Refactor getAttackableEntityIds into getAttackableEntities
Move suggest into a module and write tests for it
Add suggestions for starting game (properly)
Add suggestions for targetMode.modal and targetMode.codex
Add suggestions for building fixtures
Auto-resolve targetMode.multiple when there's only one valid combination
Move abilities/ out of cardinfo/ to untangle some imports
Store 'patrolSlot' in entity.current to simplify attack logic
Use a schema validation library to simplify action checking
Make sure it works out of the box, i.e. without npm linking playground

# Cards that will need special attention

Trigger on who-killed or how-killed:
. Captain Zane (Red/Anarchy)
. Gunpoint Taxman (Red/Anarchy)
. Firehouse (Red/Fire)
. Jandra, the Negator (Black/starter)
. Shadow Blade (Black/Demonology)
Delayed Trigger:
. Desperation (Red/Blood)
. Bloodlust (Red/Blood)
. Vandy Anadrose (Black/Demonology)
. Death Rites (Black/Necromancy)
. Promise of Payment (Purple/Future)
Modify arriving units:
. Drakk Ramhorn
Modifying ability damage:
. Hotter Fire (Red/Fire)
Damage prevention:
. Focus Master (White/Discipline)
. Morningstar Pass (White/Strength)
. Sentry (Purple/Present)
. Blackhand Dozer (Black/Demonology)
Order of continous effects matters:
. Master Midori (Green/Balance)
. Behind the Ferns (Green/Feral)
. Wandering Mimic (Green/Balance)
. Fox's Den School (White/Ninjutsu)
. Jade Fox, Den's Headmistress (White/Ninjutsu)
Conditional stealth:
. Stalking Tiger (Green/Feral)
On-exhaust trigger:
. Rampaging Elephant (Green/Feral)
Copy and modify-printed-values effects:
. Polymorph: Squirrel (Green/Growth)
. Manufactured Truth (Blue/starter)
. Chaos Mirror (Red/Anarchy)
Copiable (T0/1) legends:
. Galina Glimmer (Green/Growth)
. Jandra, the Negator (Black/starter)
Heroes can't level up:
. Nether Drain (Black/Necromancy)
. Chronofixer (Purple/Present)
Choice of how to pay costs:
. Skeletal Lord (White/Necromancy)
. True Power of Storms (White/Discipline)
. Omegacron (Purple/Future)
Replace units entering play:
. Jail (Blue/starter)
Replace units leaving play:
. Reteller of Truths (Blue/Truth)
. Graveyard (Black/starter)
. Soul Stone (Black/Demonology)
. Second Chances (Purple/Past)
. Brave Knight (Blue/Peace)
On-target trigger:
. Dreamscape (Blue/Truth)
. All Illusions (Blue/starter and Truth)
. Smoker (White/starter)
Damage Division:
. Ember Sparks (Red/Fire)
. Burning Volley (Red/Fire)
Force sacrifice:
. Sacrifice the Weak (Black/starter)
Can't be sacrificed:
. Pestering Haunt (Black/starter)
Just generally weird interactions with everything:
. Gilded Glaxx (Purple/Future)
