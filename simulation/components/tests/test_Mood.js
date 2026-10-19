Engine.LoadComponentScript("interfaces/Mood.js");
Engine.LoadComponentScript("interfaces/Promotion.js");
Engine.LoadComponentScript("interfaces/Timer.js");
Engine.LoadComponentScript("interfaces/UnitAI.js");
Engine.LoadComponentScript("Mood.js");

const entity = 801;
const friend = 802;
const player = 1;

let level = 0;
let states = { [entity]: "INDIVIDUAL.IDLE", [friend]: "INDIVIDUAL.IDLE" };
let cancelled = [];

AddMock(SYSTEM_ENTITY, IID_Timer, {
	"SetInterval": () => 7,
	"CancelTimer": id => cancelled.push(id)
});
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"ExecuteQueryAroundPos": () => [friend]
});
AddMock(entity, IID_Promotion, { "GetLevel": () => level });
AddMock(entity, IID_Ownership, { "GetOwner": () => player });
AddMock(entity, IID_Position, { "IsInWorld": () => true, "GetPosition2D": () => new Vector2D(0, 0) });
AddMock(entity, IID_UnitAI, { "GetCurrentState": () => states[entity] });
AddMock(friend, IID_UnitAI, { "GetCurrentState": () => states[friend] });

const tick = (cmp, n) => { for (let i = 0; i < n; ++i) cmp.Tick(); };

let cmpMood = ConstructComponent(entity, "Mood", {});

// Promotion: happy replaces sad, demotion: angry.
cmpMood.Add("sad");
level = 1;
cmpMood.OnExperienceChanged();
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["happy"]);
level = 0;
cmpMood.OnExperienceChanged();
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["happy", "angry"]);

// Re-adding moves to the end.
cmpMood.Add("happy");
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["angry", "happy"]);

// Expiry after 60 s; sad has no expiry.
cmpMood.Add("sad");
tick(cmpMood, 59);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["angry", "happy", "sad"]);
cmpMood.Tick();
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["sad"]);

// Re-adding resets the timer.
cmpMood = ConstructComponent(entity, "Mood", {});
cmpMood.Add("angry");
tick(cmpMood, 40);
cmpMood.Add("angry");
tick(cmpMood, 40);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["angry"]);

// Bored after 30 s idle with a fighting friend, cleared by combat.
cmpMood = ConstructComponent(entity, "Mood", {});
tick(cmpMood, 40);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), []);
states[friend] = "INDIVIDUAL.COMBAT.ATTACKING";
tick(cmpMood, 1);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["bored"]);
states[entity] = "INDIVIDUAL.COMBAT.APPROACHING";
tick(cmpMood, 1);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), []);
states[entity] = "INDIVIDUAL.IDLE";
tick(cmpMood, 29);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), []);
tick(cmpMood, 1);
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["bored"]);

// Restore carries state, no happy; angry on lower level, sad on 5th revive below level 3.
cmpMood = ConstructComponent(entity, "Mood", {});
level = 2;
cmpMood.Restore({ "moods": ["bored"], "level": 2, "deaths": 1, "oldLevel": 2 });
cmpMood.OnExperienceChanged();
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["bored"]);
cmpMood.Restore({ "moods": [], "level": 1, "deaths": 5, "oldLevel": 2 });
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), ["angry", "sad"]);
cmpMood.Restore({ "moods": [], "level": 3, "deaths": 5, "oldLevel": 3 });
TS_ASSERT_UNEVAL_EQUALS(cmpMood.GetMoods(), []);

cmpMood.OnDestroy();
TS_ASSERT_UNEVAL_EQUALS(cancelled, [7]);
