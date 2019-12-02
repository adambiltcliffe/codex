import {
    getGameWithUnits,
    findEntityIds,
    playActions,
    testp1Id,
    testp2Id,
    TestGame
} from "../../testutil";
import { fixtureNames } from "../../fixtures";
import { getCurrentValues } from "../../entities";
import { getAttackableEntityIds } from "../../actions/attack";


test("Healing 1 heals 1 damage from friendly units", () => {
    const s0 = getGameWithUnits(["helpful_turtle"], ["tenderfoot"]);
    const helpfulTurtle = findEntityIds(s0, e => (e.card == "helpful_turtle"))[0];
    const tenderfoot = findEntityIds(s0, e => (e.card == "tenderfoot"))[0]; 
    const s1 = playActions(s0, [{ type: "attack", attacker: helpfulTurtle, target: tenderfoot }]);
    expect(s1.entities[helpfulTurtle].damage).toEqual(1);
    expect(s1.entities[tenderfoot].damage).toEqual(1)
    const s2 = playActions(s1, [{type: "endTurn"}])
    expect(s2.entities[helpfulTurtle].damage).toEqual(1);
    expect(s2.entities[tenderfoot].damage).toEqual(1)
    const s3 = playActions(s2, [{type: "endTurn"}])
    expect(s3.entities[helpfulTurtle].damage).toEqual(0);
    expect(s3.entities[tenderfoot].damage).toEqual(1)
});

test("Healing 1 heals 1 damage from friendly heros", () => {
     const tg = new TestGame()
    .insertEntity(testp1Id, "helpful_turtle")
    .insertEntity(testp1Id, "river_montoya")
    .insertEntity(testp2Id, "troq_bashar");
    const [_, river, troq] = tg.insertedEntityIds;
    tg.playActions([{type: "endTurn"}, {type: "endTurn"}]);
    const s0 = tg.state;
    const s1 = playActions(s0, [{ type: "attack", attacker: river, target: troq }]);
    expect(s1.entities[river].damage).toEqual(2);
    expect(s1.entities[troq].damage).toEqual(2)
    const s2 = playActions(s1, [{type: "endTurn"}])
    expect(s2.entities[river].damage).toEqual(2);
    expect(s2.entities[troq].damage).toEqual(2)
    const s3 = playActions(s2, [{type: "endTurn"}])
    expect(s3.entities[river].damage).toEqual(1);
    expect(s3.entities[troq].damage).toEqual(2)
});

test("Healing 1 does not heal 1 damage from friendly buildings", () => {
    const tg = new TestGame()
    .insertEntity(testp1Id, "helpful_turtle")
    .insertEntity(testp2Id, "tenderfoot");
    const [_, tenderfoot] = tg.insertedEntityIds;
    const p1Base = tg.findBaseId(testp1Id);
    const s0 = tg.state;
    const s1 = playActions(s0, [{type: "endTurn"}, { type: "attack", attacker: tenderfoot, target: p1Base}]);
    expect(s1.entities[p1Base].damage).toEqual(1)
    const s2 = playActions(s1, [{type: "endTurn"}])
    expect(s2.entities[p1Base].damage).toEqual(1)
})