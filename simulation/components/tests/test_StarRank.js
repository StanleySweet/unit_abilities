Engine.LoadComponentScript("interfaces/Promotion.js");
Engine.LoadComponentScript("interfaces/ModifiersManager.js");
Engine.LoadComponentScript("StarRank.js");

const entity = 701;
let removed = [];
let added = [];
let messages = [];

AddMock(SYSTEM_ENTITY, IID_ModifiersManager, {
	"RemoveAllModifiers": (id, ent) => removed.push([id, ent]),
	"AddModifiers": (id, mods, ent) => added.push([id, mods, ent])
});

Engine.PostMessage = (ent, type, data) => messages.push([ent, type]);

let cmpStarRank = ConstructComponent(entity, "StarRank", {});

// Below the threshold: no level, no modifiers, but the XP bar is notified.
cmpStarRank.IncreaseXp(99);
TS_ASSERT_EQUALS(cmpStarRank.GetLevel(), 0);
TS_ASSERT_EQUALS(cmpStarRank.GetLevelName(), "Leader");
TS_ASSERT_EQUALS(cmpStarRank.GetCurrentXp(), 99);
TS_ASSERT_EQUALS(cmpStarRank.GetRequiredXp(), 100);
TS_ASSERT_EQUALS(added.length, 0);
TS_ASSERT_EQUALS(messages.length, 1);
TS_ASSERT_EQUALS(messages[0][0], entity);
TS_ASSERT_EQUALS(messages[0][1], MT_ExperienceChanged);

// Level 1: armor and damage only, zero values are skipped.
cmpStarRank.IncreaseXp(1);
TS_ASSERT_EQUALS(cmpStarRank.GetLevel(), 1);
TS_ASSERT_EQUALS(cmpStarRank.GetLevelName(), "Corporal");
TS_ASSERT_EQUALS(cmpStarRank.GetCurrentXp(), 0);
TS_ASSERT_EQUALS(cmpStarRank.GetRequiredXp(), 200);
TS_ASSERT_UNEVAL_EQUALS(removed, [["StarRank", entity]]);
TS_ASSERT_UNEVAL_EQUALS(added, [["StarRank", {
	"Resistance/Entity/Damage/Hack": [{ "affects": [["Unit"]], "add": 1 }],
	"Resistance/Entity/Damage/Pierce": [{ "affects": [["Unit"]], "add": 1 }],
	"Attack/Melee/Damage/Hack": [{ "affects": [["Unit"]], "add": 1 }]
}, entity]]);
TS_ASSERT_EQUALS(messages.length, 2);

// Many levels in one call, then everything further is ignored.
removed = [];
added = [];
messages = [];
cmpStarRank = ConstructComponent(entity, "StarRank", {});
cmpStarRank.IncreaseXp(1500);
TS_ASSERT_EQUALS(cmpStarRank.GetLevel(), 5);
TS_ASSERT_EQUALS(cmpStarRank.GetLevelName(), "General");
TS_ASSERT_EQUALS(cmpStarRank.GetRequiredXp(), 0);
TS_ASSERT_EQUALS(added.length, 1);
TS_ASSERT_UNEVAL_EQUALS(added[0][1], {
	"Health/Max": [{ "affects": [["Unit"]], "add": 150 }],
	"Health/RegenRate": [{ "affects": [["Unit"]], "add": 3.5 }],
	"Resistance/Entity/Damage/Hack": [{ "affects": [["Unit"]], "add": 5 }],
	"Resistance/Entity/Damage/Pierce": [{ "affects": [["Unit"]], "add": 5 }],
	"Attack/Melee/Damage/Hack": [{ "affects": [["Unit"]], "add": 13 }]
});
TS_ASSERT_EQUALS(messages.length, 1);

cmpStarRank.IncreaseXp(1000);
TS_ASSERT_EQUALS(cmpStarRank.GetLevel(), 5);
TS_ASSERT_EQUALS(cmpStarRank.GetCurrentXp(), 0);
TS_ASSERT_EQUALS(added.length, 1);
TS_ASSERT_EQUALS(messages.length, 1);

// Custom <Levels> override the defaults.
const levels = {};
for (let i = 1; i <= 5; ++i)
	levels["Level" + i] = { "RequiredXp": "10", "Health": "1", "Regen": "0", "Armor": "0", "Damage": "0" };
cmpStarRank = ConstructComponent(entity, "StarRank", { "Levels": levels });
TS_ASSERT_EQUALS(cmpStarRank.GetRequiredXp(), 10);
cmpStarRank.IncreaseXp(10);
TS_ASSERT_EQUALS(cmpStarRank.GetLevel(), 1);
TS_ASSERT_UNEVAL_EQUALS(added[added.length - 1][1], { "Health/Max": [{ "affects": [["Unit"]], "add": 1 }] });
