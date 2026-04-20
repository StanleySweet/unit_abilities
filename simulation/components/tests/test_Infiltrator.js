Engine.LoadComponentScript("interfaces/Infiltrator.js");
Engine.LoadComponentScript("interfaces/InfiltrationEntrance.js");
Engine.LoadComponentScript("interfaces/InfiltrationManager.js");
Engine.LoadComponentScript("interfaces/Player.js");
Engine.LoadComponentScript("interfaces/PlayerManager.js");
Engine.LoadComponentScript("interfaces/ResourceGatherer.js");
Engine.LoadComponentScript("interfaces/StatusBars.js");
Engine.LoadComponentScript("interfaces/Timer.js");
Engine.LoadComponentScript("interfaces/UnitAI.js");
Engine.LoadComponentScript("Infiltrator.js");
Engine.LoadComponentScript("Timer.js");

const cmpTimer = ConstructComponent(SYSTEM_ENTITY, "Timer");
const thief = 401;
const target = 402;
const enemyPlayer = 403;

let stopped = false;
let regenerated = 0;
let jumpedTo = undefined;
let carrying = [];
let inWorld = true;
let movedOutOfWorld = 0;
let registered = undefined;
let unregistered = undefined;
let targetRegenerated = 0;
const enemyResources = { "metal": 20 };
let addedEntities = [];
let destroyedEntities = [];
const originalAddEntity = Engine.AddEntity;
const originalDestroyEntity = Engine.DestroyEntity;
Engine.AddEntity = template =>
{
	addedEntities.push(template);
	return 900 + addedEntities.length;
};
Engine.DestroyEntity = entity => destroyedEntities.push(entity);

AddMock(SYSTEM_ENTITY, IID_PlayerManager, {
	"GetPlayerByID": playerID => playerID == 9 ? enemyPlayer : INVALID_ENTITY
});

AddMock(enemyPlayer, IID_Player, {
	"GetResourceCounts": () => enemyResources
});

AddMock(SYSTEM_ENTITY, IID_InfiltrationManager, {
	"Register": (targetEntity, sourceEntity, startTime, duration) =>
		registered = { "target": targetEntity, "source": sourceEntity, "startTime": startTime, "duration": duration },
	"Unregister": (targetEntity, sourceEntity) =>
		unregistered = { "target": targetEntity, "source": sourceEntity }
});

AddMock(thief, IID_UnitAI, {
	"Stop": () => stopped = true
});

AddMock(thief, IID_StatusBars, {
	"RegenerateSprites": () => ++regenerated
});

AddMock(thief, IID_Ownership, {
	"GetOwner": () => 1
});

AddMock(thief, IID_ResourceGatherer, {
	"DropResources": () => carrying = [],
	"GiveResources": resources => carrying = resources
});

AddMock(thief, IID_Position, {
	"IsInWorld": () => inWorld,
	"GetPosition2D": () => new Vector2D(10, 10),
	"MoveOutOfWorld": () =>
	{
		inWorld = false;
		++movedOutOfWorld;
	},
	"JumpTo": (x, z) =>
	{
		inWorld = true;
		jumpedTo = [x, z];
	}
});

AddMock(901, IID_Ownership, {
	"SetOwner": () => {}
});

AddMock(901, IID_Position, {
	"JumpTo": () => {}
});

AddMock(target, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition2D": () => new Vector2D(12, 10)
});

AddMock(target, IID_StatusBars, {
	"RegenerateSprites": () => ++targetRegenerated
});

AddMock(target, IID_Ownership, {
	"GetOwner": () => 9
});

const cmpInfiltrator = ConstructComponent(thief, "Infiltrator");
TS_ASSERT(cmpInfiltrator.StartInfiltration(target, {
	"duration": 5000,
	"resourceType": "metal",
	"amount": 7,
	"escapeDistance": 6
}));
TS_ASSERT(stopped);
TS_ASSERT(cmpInfiltrator.IsInfiltrating());
TS_ASSERT_EQUALS(cmpInfiltrator.GetStolenFrom(), 9);
TS_ASSERT_EQUALS(movedOutOfWorld, 1);
TS_ASSERT(!inWorld);
TS_ASSERT_EQUALS(registered.target, target);
TS_ASSERT_EQUALS(registered.source, thief);
TS_ASSERT(regenerated > 0);
TS_ASSERT(targetRegenerated > 0);
TS_ASSERT_UNEVAL_EQUALS(addedEntities, ["special/unit_abilities/infiltrator_revealer"]);

cmpTimer.OnUpdate({ "turnLength": 2.5 });
TS_ASSERT(cmpInfiltrator.GetProgress() > 0);
TS_ASSERT(cmpInfiltrator.GetProgress() < 1);

cmpTimer.OnUpdate({ "turnLength": 2.6 });
TS_ASSERT(!cmpInfiltrator.IsInfiltrating());
TS_ASSERT_UNEVAL_EQUALS(carrying, [{
	"type": "metal",
	"amount": 7
}]);
TS_ASSERT_EQUALS(enemyResources.metal, 13);
TS_ASSERT(inWorld);
TS_ASSERT_EQUALS(unregistered.target, target);
TS_ASSERT_EQUALS(unregistered.source, thief);
TS_ASSERT_UNEVAL_EQUALS(jumpedTo, [6, 10]);
TS_ASSERT_UNEVAL_EQUALS(destroyedEntities, [901]);

const scriptedThief = 404;
const scriptedTarget = 405;
let scriptedJumps = [];
let scriptedInWorld = true;
let scriptedMovedOutOfWorld = 0;
let scriptedRegeneration = 0;
let scriptedRegistered = undefined;
let scriptedUnregistered = undefined;
let scriptedWalks = [];
let scriptedPosition = new Vector2D(10, 10);

AddMock(SYSTEM_ENTITY, IID_InfiltrationManager, {
	"Register": (targetEntity, sourceEntity) => scriptedRegistered = [targetEntity, sourceEntity],
	"Unregister": (targetEntity, sourceEntity) => scriptedUnregistered = [targetEntity, sourceEntity]
});

AddMock(scriptedThief, IID_UnitAI, {
	"Stop": () => {},
	"WalkToPointRange": (x, z, min, max, queued, pushFront) =>
	{
		scriptedWalks.push({ "x": x, "z": z, "min": min, "max": max, "queued": queued, "pushFront": pushFront });
		return true;
	}
});

AddMock(scriptedThief, IID_StatusBars, {
	"RegenerateSprites": () => ++scriptedRegeneration
});

AddMock(scriptedThief, IID_Ownership, {
	"GetOwner": () => 1
});

AddMock(scriptedThief, IID_ResourceGatherer, {
	"DropResources": () => {},
	"GiveResources": () => {}
});

AddMock(scriptedThief, IID_Position, {
	"IsInWorld": () => scriptedInWorld,
	"GetPosition2D": () => scriptedPosition,
	"MoveOutOfWorld": () =>
	{
		scriptedInWorld = false;
		++scriptedMovedOutOfWorld;
	},
	"JumpTo": (x, z) =>
	{
		scriptedInWorld = true;
		scriptedPosition = new Vector2D(x, z);
		scriptedJumps.push([x, z]);
	}
});

AddMock(902, IID_Ownership, {
	"SetOwner": () => {}
});

AddMock(902, IID_Position, {
	"JumpTo": () => {}
});

AddMock(scriptedTarget, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition2D": () => new Vector2D(20, 10)
});

AddMock(scriptedTarget, IID_Ownership, {
	"GetOwner": () => 9
});

AddMock(scriptedTarget, IID_StatusBars, {
	"RegenerateSprites": () => {}
});

AddMock(scriptedTarget, IID_InfiltrationEntrance, {
	"GetEntryPath": () => [new Vector2D(11, 10), new Vector2D(12, 10), new Vector2D(13, 10)],
	"GetExitPath": () => [new Vector2D(12, 10), new Vector2D(11, 10)],
	"GetStepTime": () => 1000
});

const scriptedInfiltrator = ConstructComponent(scriptedThief, "Infiltrator");
TS_ASSERT(scriptedInfiltrator.StartInfiltration(scriptedTarget, {
	"duration": 5000,
	"resourceType": "metal",
	"amount": 3,
	"escapeDistance": 5
}));
TS_ASSERT_UNEVAL_EQUALS(scriptedJumps, []);
TS_ASSERT_UNEVAL_EQUALS(scriptedWalks, [{
	"x": 11,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": false,
	"pushFront": false
}]);
TS_ASSERT_EQUALS(scriptedMovedOutOfWorld, 0);

scriptedPosition = new Vector2D(11, 10);
cmpTimer.OnUpdate({ "turnLength": 0.3 });
TS_ASSERT_UNEVAL_EQUALS(scriptedJumps, [[12, 10]]);
TS_ASSERT_EQUALS(scriptedMovedOutOfWorld, 1);
TS_ASSERT_UNEVAL_EQUALS(scriptedWalks, [{
	"x": 11,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": false,
	"pushFront": false
}, {
	"x": 12,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": false,
	"pushFront": false
}, {
	"x": 13,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": true,
	"pushFront": false
}]);

scriptedPosition = new Vector2D(13, 10);
cmpTimer.OnUpdate({ "turnLength": 0.2 });
TS_ASSERT_UNEVAL_EQUALS(scriptedJumps, [[12, 10]]);
TS_ASSERT_EQUALS(scriptedMovedOutOfWorld, 1);
TS_ASSERT_UNEVAL_EQUALS(scriptedRegistered, [scriptedTarget, scriptedThief]);
TS_ASSERT_UNEVAL_EQUALS(addedEntities, ["special/unit_abilities/infiltrator_revealer", "special/unit_abilities/infiltrator_revealer"]);

cmpTimer.OnUpdate({ "turnLength": 5.1 });
TS_ASSERT_UNEVAL_EQUALS(scriptedUnregistered, [scriptedTarget, scriptedThief]);
TS_ASSERT_UNEVAL_EQUALS(scriptedJumps, [[12, 10], [12, 10]]);
TS_ASSERT(!scriptedInfiltrator.IsInfiltrating());
TS_ASSERT_UNEVAL_EQUALS(destroyedEntities, [901, 902]);
TS_ASSERT_UNEVAL_EQUALS(scriptedWalks, [{
	"x": 11,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": false,
	"pushFront": false
}, {
	"x": 12,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": false,
	"pushFront": false
}, {
	"x": 13,
	"z": 10,
	"min": 0,
	"max": 0.75,
	"queued": true,
	"pushFront": false
}, {
	"x": 11,
	"z": 10,
	"min": 0,
	"max": 0,
	"queued": false,
	"pushFront": false
}]);

Engine.AddEntity = originalAddEntity;
Engine.DestroyEntity = originalDestroyEntity;
