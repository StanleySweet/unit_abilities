Engine.LoadComponentScript("interfaces/PetCompanion.js");
Engine.LoadComponentScript("interfaces/SpawnedEntity.js");
Engine.LoadComponentScript("interfaces/Timer.js");
Engine.LoadComponentScript("interfaces/UnitAI.js");
Engine.LoadComponentScript("PetCompanion.js");
Engine.LoadComponentScript("SpawnedEntity.js");
Engine.LoadComponentScript("Timer.js");

const cmpTimer = ConstructComponent(SYSTEM_ENTITY, "Timer");
const owner = 601;
const pet = 602;
const player = 1;

let ownerPosition = new Vector2D(20, 20);
let petPosition = new Vector2D(21, 21);
let petOwner = INVALID_PLAYER;
let petSpawner = INVALID_ENTITY;
let destroyedPet = INVALID_ENTITY;
let walkCalls = [];
let addedTemplate = undefined;

const originalRandom = Math.random;
let randomValues = [0.0, 0.5, 0.25, 0.75, 0.5, 0.5];
Math.random = () => randomValues.length ? randomValues.shift() : 0.5;

AddMock(owner, IID_Ownership, {
	"GetOwner": () => player
});

AddMock(owner, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition2D": () => ownerPosition
});

Engine.AddEntity = template =>
{
	addedTemplate = template;
	AddMock(pet, IID_Position, {
		"IsInWorld": () => true,
		"GetPosition2D": () => petPosition,
		"JumpTo": (x, z) => petPosition = new Vector2D(x, z)
	});
	AddMock(pet, IID_Ownership, {
		"SetOwner": ownerID => petOwner = ownerID
	});
	AddMock(pet, IID_UnitAI, {
		"WalkToPointRange": (x, z, min, max, queued, pushFront) =>
		{
			walkCalls.push({ "x": x, "z": z, "min": min, "max": max, "queued": queued, "pushFront": pushFront });
			return true;
		}
	});
	AddMock(pet, IID_SpawnedEntity, {
		"SetSpawner": entity => petSpawner = entity
	});
	return pet;
};

Engine.DestroyEntity = entity =>
{
	destroyedPet = entity;
};

const cmpPetCompanion = ConstructComponent(owner, "PetCompanion", {
	"Template": "special/unit_abilities/buzzard_pet",
	"WanderInterval": "1000",
	"WanderMinRange": "4",
	"WanderMaxRange": "8",
	"LeashRadius": "12",
	"DirectedRange": "20",
	"DirectedLoiterTime": "4000",
	"ApproachRange": "2"
});

cmpPetCompanion.OnOwnershipChanged({ "from": INVALID_PLAYER, "to": player });
TS_ASSERT_EQUALS(cmpPetCompanion.GetPet(), pet);
TS_ASSERT_EQUALS(addedTemplate, "special/unit_abilities/buzzard_pet");
TS_ASSERT_EQUALS(petOwner, player);
TS_ASSERT_EQUALS(petSpawner, owner);

cmpTimer.OnUpdate({ "turnLength": 1.1 });
TS_ASSERT_EQUALS(walkCalls.length, 1);
TS_ASSERT_EQUALS(walkCalls[0].min, 0);
TS_ASSERT_EQUALS(walkCalls[0].max, 2);

walkCalls = [];
TS_ASSERT(cmpPetCompanion.CommandPetToPoint(new Vector2D(28, 20), { "LoiterTime": "3000" }));
TS_ASSERT_EQUALS(walkCalls.length, 1);
TS_ASSERT_EQUALS(walkCalls[0].x, 28);
TS_ASSERT_EQUALS(walkCalls[0].z, 20);

walkCalls = [];
petPosition = new Vector2D(28, 20);
cmpTimer.OnUpdate({ "turnLength": 3.2 });
TS_ASSERT(walkCalls.length >= 1);
TS_ASSERT(walkCalls.every(call => call.x == 28 && call.z == 20));

walkCalls = [];
ownerPosition = new Vector2D(60, 60);
petPosition = new Vector2D(28, 20);
cmpTimer.OnUpdate({ "turnLength": 1.1 });
TS_ASSERT(walkCalls.length >= 1);
TS_ASSERT(walkCalls.some(call => Math.euclidDistance2D(call.x, call.z, ownerPosition.x, ownerPosition.y) <= 4.1));

cmpPetCompanion.OnDestroy();
TS_ASSERT_EQUALS(destroyedPet, pet);

Math.random = originalRandom;
