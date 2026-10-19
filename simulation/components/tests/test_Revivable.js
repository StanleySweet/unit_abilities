Engine.LoadComponentScript("interfaces/Health.js");
Engine.LoadComponentScript("interfaces/Promotion.js");
Engine.LoadComponentScript("interfaces/Revivable.js");
Engine.LoadComponentScript("interfaces/Timer.js");
Engine.LoadComponentScript("interfaces/UnitAI.js");
Engine.LoadComponentScript("Revivable.js");
Engine.LoadComponentScript("Timer.js");

const fighter = 801;
const marker = 802;
const revived = 803;
const player = 1;

// Rank table (Settlers 5): max(L - 2, 1), 0 stays 0.
const cmpTable = ConstructComponent(fighter, "Revivable", {});
TS_ASSERT_UNEVAL_EQUALS([0, 1, 2, 3, 4, 5].map(l => cmpTable.GetRevivedLevel(l)), [0, 1, 1, 1, 2, 3]);

let created = [];
let markerOwner;
let markerPosition;
let destroyed = [];
let enemiesNear = false;
let alliesNear = true;
let playerState = "active";
let revivedHitpoints;
let revivedLevel;
let revivedPosition;
let revivedOwner;

AddMock(SYSTEM_ENTITY, IID_TemplateManager, {
	"GetCurrentTemplateName": () => "units/unit_abilities/superfighter_ninja"
});
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"ExecuteQuery": (ent, min, max, players, iid) =>
		(players[0] == 2 ? enemiesNear : alliesNear) ? [900] : []
});
AddMock(SYSTEM_ENTITY, IID_Timer, {
	"SetInterval": () => 7,
	"CancelTimer": () => {}
});
QueryPlayerIDInterface = id => ({
	"GetState": () => playerState,
	"GetEnemies": () => [2],
	"GetMutualAllies": () => [1]
});

AddMock(fighter, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition2D": () => new Vector2D(10, 20),
	"GetRotation": () => ({ "x": 0, "y": 1.5, "z": 0 })
});
AddMock(fighter, IID_Ownership, { "GetOwner": () => player });
AddMock(fighter, IID_Promotion, { "GetLevel": () => 5 });

Engine.AddEntity = template =>
{
	created.push(template);
	if (template == "special/unit_abilities/revive_marker")
	{
		AddMock(marker, IID_Position, {
			"JumpTo": (x, z) => markerPosition = [x, z],
			"SetYRotation": () => {},
			"GetPosition2D": () => new Vector2D(markerPosition[0], markerPosition[1])
		});
		AddMock(marker, IID_Ownership, { "SetOwner": o => markerOwner = o });
		return marker;
	}
	AddMock(revived, IID_Position, {
		"JumpTo": (x, z) => revivedPosition = [x, z],
		"SetYRotation": () => {}
	});
	AddMock(revived, IID_Ownership, { "SetOwner": o => revivedOwner = o });
	AddMock(revived, IID_Promotion, { "SetLevel": l => revivedLevel = l });
	AddMock(revived, IID_Health, {
		"GetMaxHitpoints": () => 300,
		"SetHitpoints": h => revivedHitpoints = h
	});
	return revived;
};
Engine.DestroyEntity = ent => destroyed.push(ent);

const cmpMarker = ConstructComponent(marker, "Revivable", {});
const cmpRevived = ConstructComponent(revived, "Revivable", {});

// Not a death: nothing happens.
cmpTable.OnHealthChanged({ "from": 100, "to": 50 });
TS_ASSERT_EQUALS(created.length, 0);

// Death: marker at the death position with the owner.
cmpTable.OnHealthChanged({ "from": 50, "to": 0 });
TS_ASSERT_UNEVAL_EQUALS(created, ["special/unit_abilities/revive_marker"]);
TS_ASSERT_UNEVAL_EQUALS(markerPosition, [10, 20]);
TS_ASSERT_EQUALS(markerOwner, player);

// Enemy near: no progress, and it decays.
for (let i = 0; i < 3; ++i)
	cmpMarker.Tick();
TS_ASSERT_EQUALS(cmpMarker.GetProgress(), 3);
enemiesNear = true;
cmpMarker.Tick();
TS_ASSERT_EQUALS(cmpMarker.GetProgress(), 2);
for (let i = 0; i < 5; ++i)
	cmpMarker.Tick();
TS_ASSERT_EQUALS(cmpMarker.GetProgress(), 0);
enemiesNear = false;

// No allies: no progress.
alliesNear = false;
cmpMarker.Tick();
TS_ASSERT_EQUALS(cmpMarker.GetProgress(), 0);
alliesNear = true;

// 11 safe ticks revive: Major-or-better loses 2 ranks (General -> Major), 50% health.
for (let i = 0; i < 10; ++i)
	cmpMarker.Tick();
TS_ASSERT_EQUALS(created.length, 1);
cmpMarker.Tick();
TS_ASSERT_EQUALS(created.length, 2);
TS_ASSERT_EQUALS(created[1], "units/unit_abilities/superfighter_ninja");
TS_ASSERT_EQUALS(revivedLevel, 3);
TS_ASSERT_EQUALS(revivedHitpoints, 150);
TS_ASSERT_EQUALS(revivedOwner, player);
TS_ASSERT_UNEVAL_EQUALS(revivedPosition, [10, 20]);
TS_ASSERT_EQUALS(cmpRevived.GetDeaths(), 1);
TS_ASSERT_UNEVAL_EQUALS(destroyed, [marker]);

// Defeated owner: the marker disappears.
destroyed = [];
cmpMarker.Arm({ "template": "x", "owner": player, "level": 2, "deaths": 1, "rotation": 0 });
playerState = "defeated";
cmpMarker.Tick();
TS_ASSERT_UNEVAL_EQUALS(destroyed, [marker]);
