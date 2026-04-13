Engine.LoadHelperScript("Player.js");
Engine.LoadHelperScript("Sound.js");
const attackCalls = [];
Engine.RegisterGlobal("AttackHelper", {
	"BuildAttackEffectsSchema": () =>
		"<optional>" +
			"<element name='Damage'><oneOrMore><element><anyName/><ref name='nonNegativeDecimal' /></element></oneOrMore></element>" +
		"</optional>" +
		"<optional><element name='Capture'><ref name='nonNegativeDecimal' /></element></optional>" +
		"<optional><element name='ApplyStatus'><text/></element></optional>" +
		"<optional><element name='Bonuses'><text/></element></optional>",
	"GetAttackEffectsData": (valueModifRoot, template, entity) =>
	{
		const result = {};
		if (template.Damage)
		{
			result.Damage = {};
			for (const damageType in template.Damage)
				result.Damage[damageType] = +template.Damage[damageType];
		}
		if (template.Capture !== undefined)
			result.Capture = +template.Capture;
		if (template.ApplyStatus)
			result.ApplyStatus = template.ApplyStatus;
		if (template.Bonuses)
			result.Bonuses = template.Bonuses;
		return result;
	},
	"HandleAttackEffects": (target, data) => attackCalls.push({ "target": target, "data": data })
});
Engine.LoadComponentScript("interfaces/Abilities.js");
Engine.LoadComponentScript("interfaces/Diplomacy.js");
Engine.LoadComponentScript("interfaces/Health.js");
Engine.LoadComponentScript("interfaces/Player.js");
Engine.LoadComponentScript("interfaces/PlayerManager.js");
Engine.LoadComponentScript("interfaces/DelayedDamage.js");
Engine.LoadComponentScript("interfaces/Infiltrator.js");
Engine.LoadComponentScript("interfaces/SpawnedEntity.js");
Engine.LoadComponentScript("interfaces/StatusEffectsReceiver.js");
Engine.LoadComponentScript("interfaces/Timer.js");
Engine.LoadComponentScript("interfaces/UnitAI.js");
Engine.LoadComponentScript("Abilities.js");
Engine.LoadComponentScript("Timer.js");

const firstEntity = 101;
const secondEntity = 102;
const thirdEntity = 103;
const fourthEntity = 104;
const fifthEntity = 105;
const gaiaTargetEntity = 106;
const restrictedTargetEntity = 107;
const queuedTargetEntity = 108;
const allyTargetEntity = 109;
const enemyStructureEntity = 110;
const enemyMilitaryStructureEntity = 111;
const localEffectEntity = 301;
const playerEntity = 1007;
const allyPlayerEntity = 1008;
const enemyPlayerEntity = 1009;
const owner = 7;
const ally = 8;
const enemy = 9;

const cmpTimer = ConstructComponent(SYSTEM_ENTITY, "Timer");

let addedLocalTemplate = undefined;
let destroyedEntity = undefined;
let addedEntityTemplate = undefined;
let playedSound = undefined;
let selectedAnimation = undefined;
let selectedOnce = undefined;
let selectedSpeed = undefined;
let selectedVariant = undefined;
let jumpedTo = undefined;
let rotatedTo = undefined;
let effectOwner = undefined;
let spawnedJumpedTo = undefined;
let spawnedOwner = undefined;
let resetVariantCalled = false;
let resetAnimationCalled = false;
let autoOrders = [];
let autoState = "INDIVIDUAL.IDLE";
let statusCalls = [];
let healCalls = [];
let infiltrationCalls = [];
let queryPlayers = undefined;
let queryType = undefined;
let aroundQueryPosition = undefined;
let convertedOwner = undefined;
let activeOrders = [];
let launchedProjectile = undefined;
let delayedHitCalls = [];
let casterPosition2D = new Vector2D(11, 13);
let casterPosition3D = new Vector3D(11, 0, 13);
let movedToPointRange = undefined;
let walkedToPointRange = undefined;
let facedTarget = undefined;
let addedOrders = [];
let queuedTargetPosition2D = new Vector2D(90, 90);
let queuedTargetPosition3D = new Vector3D(90, 0, 90);
let ownedEntities = [];
let obstructionInRange = false;

AddMock(SYSTEM_ENTITY, IID_PlayerManager, {
	"GetAllPlayers": () => [0, owner, ally, enemy],
	"GetPlayerByID": id => ({
		[owner]: playerEntity,
		[ally]: allyPlayerEntity,
		[enemy]: enemyPlayerEntity
	}[id])
});

AddMock(playerEntity, IID_Player, {
	"GetPlayerID": () => owner
});

AddMock(allyPlayerEntity, IID_Player, {
	"GetPlayerID": () => ally
});

AddMock(enemyPlayerEntity, IID_Player, {
	"GetPlayerID": () => enemy
});

Engine.AddLocalEntity = template =>
{
	addedLocalTemplate = template;
	return localEffectEntity;
};

Engine.AddEntity = template =>
{
	addedEntityTemplate = template;
	return fifthEntity;
};

Engine.DestroyEntity = entity =>
{
	destroyedEntity = entity;
};

AddMock(firstEntity, IID_Sound, {
	"PlaySoundGroup": name => playedSound = name,
	"GetSoundGroup": name => name == "attack_impact_ranged" ? "attack/impact/arrow_impact.xml" : ""
});

AddMock(firstEntity, IID_Ownership, {
	"GetOwner": () => owner
});

AddMock(firstEntity, IID_Infiltrator, {
	"StartInfiltration": (target, data) =>
	{
		infiltrationCalls.push({ "target": target, "data": data });
		return true;
	}
});

AddMock(playerEntity, IID_Diplomacy, {
	"IsAlly": player => player == ally,
	"IsMutualAlly": player => player == ally,
	"IsEnemy": player => player == enemy,
	"IsNeutral": () => false
});

AddMock(firstEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => casterPosition3D,
	"GetPosition2D": () => casterPosition2D,
	"GetRotation": () => ({ "x": 0, "y": 1.25, "z": 0 }),
	"TurnTo": y => rotatedTo = y
});

AddMock(SYSTEM_ENTITY, IID_ProjectileManager, {
	"LaunchProjectileAtPoint": (launchPoint, position, speed, gravity, actorName, impactActorName, impactAnimationLifetime) =>
	{
		launchedProjectile = {
			"launchPoint": { "x": launchPoint.x, "y": launchPoint.y, "z": launchPoint.z },
			"position": { "x": position.x, "y": position.y, "z": position.z },
			"speed": speed,
			"gravity": gravity,
			"actorName": actorName,
			"impactActorName": impactActorName,
			"impactAnimationLifetime": impactAnimationLifetime
		};
		return 501;
	},
	"RemoveProjectile": () => {}
});

AddMock(SYSTEM_ENTITY, IID_DelayedDamage, {
	"Hit": data =>
	{
		delayedHitCalls.push(data);
		AttackHelper.HandleAttackEffects(data.target, data);
	}
});

AddMock(firstEntity, IID_Visual, {
	"SelectAnimation": (name, once, speed) =>
	{
		selectedAnimation = name;
		selectedOnce = once;
		selectedSpeed = speed;
	},
	"SetVariant": (type, value) =>
	{
		selectedVariant = [type, value];
	}
});

AddMock(firstEntity, IID_UnitAI, {
	"SetDefaultAnimationVariant": () => resetVariantCalled = true,
	"SelectAnimation": (name, once, speed) =>
	{
		resetAnimationCalled = name == "idle" && !once && speed == 1.0;
	},
	"Stop": () => activeOrders = [{ "type": "Stop" }],
	"GetCurrentState": () => autoState,
	"GetOrders": () => activeOrders,
	"AddOrder": (type, data, queued, pushFront) =>
	{
		addedOrders.push({ "type": type, "data": data, "queued": queued, "pushFront": pushFront });
	},
	"WalkToPointRange": (x, z, min, max) =>
	{
		walkedToPointRange = { "x": x, "z": z, "min": min, "max": max };
		return true;
	},
	"MoveToPointRange": (x, z, min, max) =>
	{
		movedToPointRange = { "x": x, "z": z, "min": min, "max": max };
		return true;
	},
	"FaceTowardsTarget": target => facedTarget = target
});

AddMock(localEffectEntity, IID_Position, {
	"JumpTo": (x, z) => jumpedTo = [x, z],
	"SetYRotation": y => rotatedTo = y
});

AddMock(localEffectEntity, IID_Ownership, {
	"SetOwner": newOwner => effectOwner = newOwner
});

AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"GetEntitiesByPlayer": player => player == owner ? ownedEntities : [],
	"ExecuteQuery": (entity, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		queryType = "entity";
		if (iid == IID_Health)
			return players.indexOf(owner) != -1 ? [allyTargetEntity, thirdEntity] : [secondEntity, thirdEntity];
		return [firstEntity, secondEntity, thirdEntity];
	},
	"ExecuteQueryAroundPos": (position, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		queryType = "point";
		aroundQueryPosition = [position.x, position.y];
		if (iid == IID_Health)
			return players.indexOf(owner) != -1 ? [allyTargetEntity] : [secondEntity];
		return [secondEntity];
	}
});

AddMock(SYSTEM_ENTITY, IID_ObstructionManager, {
	"IsInTargetRange": (entity, target, min, max, accountForSize) => obstructionInRange
});

AddMock(firstEntity, IID_StatusEffectsReceiver, {
	"AddStatus": (code, data, source, sourceOwner) =>
		statusCalls.push({ "target": firstEntity, "code": code, "data": data, "source": source, "sourceOwner": sourceOwner })
});

AddMock(secondEntity, IID_StatusEffectsReceiver, {
	"AddStatus": (code, data, source, sourceOwner) =>
		statusCalls.push({ "target": secondEntity, "code": code, "data": data, "source": source, "sourceOwner": sourceOwner })
});

AddMock(secondEntity, IID_Health, {
	"TakeDamage": () => ({ "healthChange": -1 }),
	"Increase": amount =>
	{
		healCalls.push({ "target": secondEntity, "amount": amount });
		return { "old": 20, "new": 20 + amount };
	},
	"IsUnhealable": () => false
});

AddMock(secondEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 15, "y": 0, "z": 18 }),
	"GetPosition2D": () => new Vector2D(15, 18),
	"GetPreviousPosition": () => ({ "x": 15, "y": 0, "z": 18 }),
	"GetHeightAt": () => 0
});

AddMock(secondEntity, IID_Ownership, {
	"GetOwner": () => enemy,
	"SetOwner": newOwner => convertedOwner = newOwner
});

AddMock(secondEntity, IID_Identity, {
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
});

AddMock(thirdEntity, IID_Health, {
	"TakeDamage": () => ({ "healthChange": -1 }),
	"Increase": amount =>
	{
		healCalls.push({ "target": thirdEntity, "amount": amount });
		return { "old": 30, "new": 30 + amount };
	},
	"IsUnhealable": () => true
});

AddMock(thirdEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 80, "y": 0, "z": 80 }),
	"GetPosition2D": () => new Vector2D(80, 80),
	"GetPreviousPosition": () => ({ "x": 80, "y": 0, "z": 80 }),
	"GetHeightAt": () => 0
});

AddMock(thirdEntity, IID_Ownership, {
	"GetOwner": () => owner
});

AddMock(thirdEntity, IID_Identity, {
	"HasClass": className => className == "Structure"
});

AddMock(fifthEntity, IID_Position, {
	"JumpTo": (x, z) => spawnedJumpedTo = [x, z],
	"SetYRotation": () => {}
});

AddMock(fifthEntity, IID_Ownership, {
	"SetOwner": newOwner => spawnedOwner = newOwner
});

AddMock(gaiaTargetEntity, IID_Health, {
	"TakeDamage": () => ({ "healthChange": -1 }),
	"Increase": amount =>
	{
		healCalls.push({ "target": gaiaTargetEntity, "amount": amount });
		return { "old": 25, "new": 25 + amount };
	},
	"IsUnhealable": () => false
});

AddMock(gaiaTargetEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 14, "y": 0, "z": 16 }),
	"GetPosition2D": () => new Vector2D(14, 16),
	"GetPreviousPosition": () => ({ "x": 14, "y": 0, "z": 16 }),
	"GetHeightAt": () => 0
});

AddMock(gaiaTargetEntity, IID_Ownership, {
	"GetOwner": () => 0,
	"SetOwner": newOwner => convertedOwner = newOwner
});

AddMock(gaiaTargetEntity, IID_Identity, {
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
});

AddMock(restrictedTargetEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 16, "y": 0, "z": 17 }),
	"GetPosition2D": () => new Vector2D(16, 17)
});

AddMock(restrictedTargetEntity, IID_Ownership, {
	"GetOwner": () => enemy
});

AddMock(restrictedTargetEntity, IID_Identity, {
	"HasClass": className => ["Unit", "Organic", "Hero", "Titan"].indexOf(className) != -1
});

AddMock(queuedTargetEntity, IID_Health, {
	"TakeDamage": () => ({ "healthChange": -1 }),
	"Increase": amount =>
	{
		healCalls.push({ "target": queuedTargetEntity, "amount": amount });
		return { "old": 18, "new": 18 + amount };
	},
	"IsUnhealable": () => false
});

AddMock(queuedTargetEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": queuedTargetPosition3D.x, "y": queuedTargetPosition3D.y, "z": queuedTargetPosition3D.z }),
	"GetPosition2D": () => new Vector2D(queuedTargetPosition2D.x, queuedTargetPosition2D.y),
	"GetPreviousPosition": () => ({ "x": queuedTargetPosition3D.x, "y": queuedTargetPosition3D.y, "z": queuedTargetPosition3D.z }),
	"GetHeightAt": () => 0
});

AddMock(queuedTargetEntity, IID_Ownership, {
	"GetOwner": () => enemy,
	"SetOwner": newOwner => convertedOwner = newOwner
});

AddMock(queuedTargetEntity, IID_Identity, {
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
});

AddMock(allyTargetEntity, IID_Health, {
	"TakeDamage": () => ({ "healthChange": -1 }),
	"Increase": amount =>
	{
		healCalls.push({ "target": allyTargetEntity, "amount": amount });
		return { "old": 12, "new": 12 + amount };
	},
	"IsUnhealable": () => false
});

AddMock(allyTargetEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 13, "y": 0, "z": 15 }),
	"GetPosition2D": () => new Vector2D(13, 15),
	"GetPreviousPosition": () => ({ "x": 13, "y": 0, "z": 15 }),
	"GetHeightAt": () => 0
});

AddMock(allyTargetEntity, IID_Ownership, {
	"GetOwner": () => owner
});

AddMock(allyTargetEntity, IID_Identity, {
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
});

AddMock(enemyStructureEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 20, "y": 0, "z": 20 }),
	"GetPosition2D": () => new Vector2D(20, 20),
	"GetPreviousPosition": () => ({ "x": 20, "y": 0, "z": 20 }),
	"GetHeightAt": () => 0
});

AddMock(enemyStructureEntity, IID_Ownership, {
	"GetOwner": () => enemy
});

AddMock(enemyStructureEntity, IID_Identity, {
	"HasClass": className => ["Structure", "Barter"].indexOf(className) != -1
});

AddMock(enemyMilitaryStructureEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 24, "y": 0, "z": 24 }),
	"GetPosition2D": () => new Vector2D(24, 24),
	"GetPreviousPosition": () => ({ "x": 24, "y": 0, "z": 24 }),
	"GetHeightAt": () => 0
});

AddMock(enemyMilitaryStructureEntity, IID_Ownership, {
	"GetOwner": () => enemy
});

AddMock(enemyMilitaryStructureEntity, IID_Identity, {
	"HasClass": className => ["Structure", "Fortress"].indexOf(className) != -1
});

const firstTemplate = {
	"BattleCry": {
		"Action": "instant",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "5000",
		"Tooltip": "Hit hard.",
		"Animation": "attack_melee",
		"AnimationVariant": "combat",
		"AnimationDuration": "750",
		"Particles": {
			"Template": "special/effects/hero_ability_aura",
			"Duration": "500"
		},
		"Sound": "attack",
		"Buff": {
			"Range": "20",
			"Duration": "3000",
			"Stackability": "Replace",
			"Modifiers": {
				"DamageBoost": {
					"Paths": {
						"_string": "Attack/Melee/Damage/Hack"
					},
					"Affects": {
						"_string": "Unit"
					},
					"Add": "2"
				}
			}
		},
		"AreaAttack": {
			"Range": "12",
			"TargetPlayers": {
				"_string": "Gaia Enemy"
			},
			"Damage": {
				"Hack": "8",
				"Crush": "4"
			}
		}
	},
	"SilentStep": {
		"Action": "instant",
		"Icon": "technologies/bloody_hands.png",
		"Cooldown": "2000"
	}
};

const cmpAbilities = ConstructComponent(firstEntity, "Abilities", firstTemplate);

TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetAbilityNames(), ["BattleCry", "SilentStep"]);
TS_ASSERT_EQUALS(cmpAbilities.GetCooldown("BattleCry"), 5000);
TS_ASSERT_EQUALS(cmpAbilities.GetCooldown("Missing"), undefined);
TS_ASSERT_EQUALS(cmpAbilities.GetRemainingCooldown("BattleCry"), 0);
TS_ASSERT_EQUALS(cmpAbilities.GetRemainingCooldown("Missing"), undefined);
TS_ASSERT(cmpAbilities.CanTriggerAbility("BattleCry"));
TS_ASSERT(!cmpAbilities.CanTriggerAbility("Missing"));
TS_ASSERT(!cmpAbilities.MatchesAutoTriggerState(undefined));
cmpAbilities.CancelAnimationResetTimer();

TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetAbilityStates(), [{
	"name": "BattleCry",
	"action": "instant",
	"icon": "technologies/fire_arrows.png",
	"cooldown": 5000,
	"cooldownRemaining": 0,
	"ready": true,
	"tooltip": "Hit hard.",
	"animation": "attack_melee",
	"animationVariant": "combat",
	"delay": 0,
	"cancelOnOrderChange": false,
	"autoTrigger": false,
	"autoTriggerInterval": 0,
	"target": {
		"type": "none"
	}
}, {
	"name": "SilentStep",
	"action": "instant",
	"icon": "technologies/bloody_hands.png",
	"cooldown": 2000,
	"cooldownRemaining": 0,
	"ready": true,
	"tooltip": "",
	"animation": "",
	"animationVariant": "",
	"delay": 0,
	"cancelOnOrderChange": false,
	"autoTrigger": false,
	"autoTriggerInterval": 0,
	"target": {
		"type": "none"
	}
}]);

TS_ASSERT(!cmpAbilities.TriggerAbility("Missing"));
TS_ASSERT(cmpAbilities.TriggerAbility("BattleCry"));
TS_ASSERT_EQUALS(addedLocalTemplate, "special/effects/hero_ability_aura");
TS_ASSERT_EQUALS(playedSound, "attack");
TS_ASSERT_UNEVAL_EQUALS(selectedVariant, ["animationVariant", "combat"]);
TS_ASSERT_EQUALS(selectedAnimation, "attack_melee");
TS_ASSERT_EQUALS(selectedOnce, true);
TS_ASSERT_EQUALS(selectedSpeed, 1.0);
TS_ASSERT_UNEVAL_EQUALS(jumpedTo, [11, 13]);
TS_ASSERT_EQUALS(rotatedTo, 1.25);
TS_ASSERT_EQUALS(effectOwner, owner);
TS_ASSERT_UNEVAL_EQUALS(queryPlayers, [0, enemy]);
TS_ASSERT_EQUALS(statusCalls.length, 2);
TS_ASSERT_EQUALS(statusCalls[0].target, firstEntity);
TS_ASSERT_EQUALS(statusCalls[0].code, "ability/101/BattleCry");
TS_ASSERT_EQUALS(statusCalls[0].data.Duration, 3000);
TS_ASSERT_EQUALS(statusCalls[0].data.Stackability, "Replace");
TS_ASSERT_UNEVAL_EQUALS(statusCalls[0].data.Modifiers, firstTemplate.BattleCry.Buff.Modifiers);
TS_ASSERT_EQUALS(statusCalls[0].source, firstEntity);
TS_ASSERT_EQUALS(statusCalls[0].sourceOwner, owner);
TS_ASSERT_EQUALS(statusCalls[1].target, secondEntity);
TS_ASSERT_EQUALS(attackCalls.length, 2);
TS_ASSERT_EQUALS(attackCalls[0].target, secondEntity);
TS_ASSERT_EQUALS(attackCalls[0].data.type, "BattleCry.AreaAttack");
TS_ASSERT_EQUALS(attackCalls[0].data.attackData.Damage.Hack, 8);
TS_ASSERT_EQUALS(attackCalls[0].data.attackData.Damage.Crush, 4);
TS_ASSERT_EQUALS(attackCalls[0].data.attacker, firstEntity);
TS_ASSERT_EQUALS(attackCalls[0].data.attackerOwner, owner);
TS_ASSERT_EQUALS(cmpAbilities.GetRemainingCooldown("BattleCry"), 5000);
TS_ASSERT(!cmpAbilities.TriggerAbility("BattleCry"));

cmpTimer.OnUpdate({ "turnLength": 0.8 });
TS_ASSERT_EQUALS(destroyedEntity, localEffectEntity);
TS_ASSERT(resetVariantCalled);
TS_ASSERT(resetAnimationCalled);

cmpTimer.OnUpdate({ "turnLength": 4.2 });
TS_ASSERT_EQUALS(cmpAbilities.GetRemainingCooldown("BattleCry"), 0);
TS_ASSERT(cmpAbilities.TriggerAbility("SilentStep"));
TS_ASSERT_EQUALS(cmpAbilities.GetRemainingCooldown("SilentStep"), 2000);

let secondEntityAnimation = undefined;
let secondEntityVariant = undefined;
AddMock(secondEntity, IID_Visual, {
	"SelectAnimation": (name, once, speed) => secondEntityAnimation = [name, once, speed],
	"SetVariant": (type, value) => secondEntityVariant = [type, value]
});

const secondTemplate = {
	"HeroicPose": {
		"Action": "instant",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "1000",
		"AnimationVariant": "combat",
		"AnimationDuration": "1000"
	}
};

const cmpAbilitiesWithoutUnitAI = ConstructComponent(secondEntity, "Abilities", secondTemplate);
cmpAbilitiesWithoutUnitAI.ResetAnimation();
TS_ASSERT_EQUALS(secondEntityVariant, undefined);
TS_ASSERT_UNEVAL_EQUALS(secondEntityAnimation, ["idle", false, 1.0]);
TS_ASSERT_EQUALS(cmpAbilitiesWithoutUnitAI.GetBuffStatusName("HeroicPose", { }), "ability/102/HeroicPose");
TS_ASSERT_EQUALS(cmpAbilitiesWithoutUnitAI.GetBuffStatusName("HeroicPose", {
	"StatusName": "SharedHeroicPose"
}), "SharedHeroicPose");
TS_ASSERT_EQUALS(cmpAbilitiesWithoutUnitAI.GetBuffStatusName("SnareTrap", {
	"StatusName": "SnareTrap"
}), "SnareTrap");
TS_ASSERT_UNEVAL_EQUALS(cmpAbilitiesWithoutUnitAI.GetBuffStatusData({
	"Duration": "2500",
	"Modifiers": {
		"MoveBoost": {
			"Paths": {
				"_string": "UnitMotion/WalkSpeed"
			},
			"Multiply": "1.1"
		}
	}
}), {
	"Duration": 2500,
	"Modifiers": {
		"MoveBoost": {
			"Paths": {
				"_string": "UnitMotion/WalkSpeed"
			},
			"Multiply": "1.1"
		}
	}
});

const thirdTemplate = {
	"NoFx": {
		"Action": "instant",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "1000",
		"Particles": {
			"Template": "special/effects/hero_ability_aura"
		}
	}
};

const cmpAbilitiesWithoutVisual = ConstructComponent(thirdEntity, "Abilities", thirdTemplate);
cmpAbilitiesWithoutVisual.TriggerAnimation(thirdTemplate.NoFx);

Engine.AddLocalEntity = template => 0;
cmpAbilitiesWithoutVisual.SpawnParticles(thirdTemplate.NoFx);
cmpAbilitiesWithoutVisual.SpawnParticles({ });

AddMock(thirdEntity, IID_Position, {
	"IsInWorld": () => false
});
AddMock(thirdEntity, IID_Ownership, {
	"GetOwner": () => owner
});

Engine.AddLocalEntity = template =>
{
	addedLocalTemplate = template;
	return localEffectEntity;
};
cmpAbilitiesWithoutVisual.SpawnParticles(thirdTemplate.NoFx);
TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetBuffTargetPlayers({
	"TargetPlayers": {
		"_string": "Player Ally Enemy"
	}
}), [owner, ally, enemy]);
TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetTargetPlayers({
	"_string": "Enemy"
}, "Player"), [enemy]);
TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetTargetPlayers({
	"_string": "Gaia Enemy"
}, "Player"), [0, enemy]);
TS_ASSERT_EQUALS(cmpAbilities.GetTargetState({
	"Type": "Entity",
	"Range": "18",
	"TargetPlayers": {
		"_string": "Enemy"
	},
	"Classes": {
		"_string": "Unit Organic"
	},
	"AllowSelf": "false"
}).type, "entity");
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { "Buff": { "Range": "10", "Duration": "1000", "Modifiers": {} } });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { "AreaAttack": { "Range": "10", "Damage": { "Hack": "2" } } });
DeleteMock(SYSTEM_ENTITY, IID_RangeManager);
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { "Buff": { "Range": "10", "Duration": "1000", "Modifiers": {} } });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { "AreaAttack": { "Range": "10", "Damage": { "Hack": "2" } } });
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"GetEntitiesByPlayer": player => player == owner ? ownedEntities : [],
	"ExecuteQuery": () => []
});
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { "Buff": { "Range": "10", "Duration": "1000", "Modifiers": {} } });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { "AreaAttack": { "Range": "10", "Damage": { "Hack": "2" } } });
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { });
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"GetEntitiesByPlayer": player => player == owner ? ownedEntities : [],
	"ExecuteQuery": (entity, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		if (iid == IID_Health)
			return [secondEntity, thirdEntity];
		return [firstEntity, secondEntity, thirdEntity];
	},
	"ExecuteQueryAroundPos": (position, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		queryType = "point";
		aroundQueryPosition = [position.x, position.y];
		if (iid == IID_Health)
			return [secondEntity];
		return [secondEntity];
	}
});

cmpAbilitiesWithoutUnitAI.TriggerAnimation(secondTemplate.HeroicPose);
TS_ASSERT_EQUALS(cmpTimer.timers.size, 1);
cmpAbilitiesWithoutUnitAI.OnDestroy();
TS_ASSERT_EQUALS(cmpTimer.timers.size, 0);

let autoPlayedSound = undefined;
AddMock(fourthEntity, IID_Sound, {
	"PlaySoundGroup": name => autoPlayedSound = name
});

AddMock(fourthEntity, IID_UnitAI, {
	"GetCurrentState": () => autoState,
	"GetOrders": () => autoOrders,
	"FaceTowardsTarget": () => {}
});

AddMock(fourthEntity, IID_Ownership, {
	"GetOwner": () => owner
});

AddMock(fourthEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 20, "y": 0, "z": 22 }),
	"GetPosition2D": () => new Vector2D(20, 22)
});

AddMock(fifthEntity, IID_Sound, {
	"PlaySoundGroup": name => autoPlayedSound = name
});

AddMock(fifthEntity, IID_Position, {
	"JumpTo": (x, z) => spawnedJumpedTo = [x, z],
	"SetYRotation": () => {},
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 24, "y": 0, "z": 26 }),
	"GetPosition2D": () => new Vector2D(24, 26)
});

AddMock(fifthEntity, IID_UnitAI, {
	"GetCurrentState": () => autoState,
	"GetOrders": () => autoOrders,
	"FaceTowardsTarget": () => {}
});

const fourthTemplate = {
	"AutoPulse": {
		"Action": "passive",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "1000",
		"Sound": "attack",
		"AutoTrigger": {
			"Interval": "1000",
			"InitialDelay": "500"
		}
	}
};

const cmpAutoAbilities = ConstructComponent(fourthEntity, "Abilities", fourthTemplate);
TS_ASSERT_UNEVAL_EQUALS(cmpAutoAbilities.GetAbilityStates(), [{
	"name": "AutoPulse",
	"action": "passive",
	"icon": "technologies/fire_arrows.png",
	"cooldown": 1000,
	"cooldownRemaining": 0,
	"ready": true,
	"tooltip": "",
	"animation": "",
	"animationVariant": "",
	"delay": 0,
	"cancelOnOrderChange": false,
	"autoTrigger": true,
	"autoTriggerInterval": 1000,
	"target": {
		"type": "none"
	}
}]);
TS_ASSERT_EQUALS(cmpTimer.timers.size, 1);
cmpTimer.OnUpdate({ "turnLength": 0.5 });
TS_ASSERT_EQUALS(autoPlayedSound, undefined);

autoState = "INDIVIDUAL.COMBAT.ATTACKING";
TS_ASSERT(cmpAutoAbilities.MatchesAutoTriggerState(fourthTemplate.AutoPulse.AutoTrigger));
cmpTimer.OnUpdate({ "turnLength": 1.0 });
TS_ASSERT_EQUALS(autoPlayedSound, "attack");

autoPlayedSound = undefined;
autoState = "INDIVIDUAL.IDLE";
autoOrders = [{ "type": "Attack" }];
TS_ASSERT(cmpAutoAbilities.MatchesAutoTriggerState(fourthTemplate.AutoPulse.AutoTrigger));
cmpTimer.OnUpdate({ "turnLength": 1.0 });
TS_ASSERT_EQUALS(autoPlayedSound, "attack");

autoPlayedSound = undefined;
autoState = "INDIVIDUAL.COMBAT.APPROACHING";
autoOrders = [];
cmpAutoAbilities.OnDestroy();

destroyedEntity = undefined;
const autoTargetTemplate = {
	"AutoSnare": {
		"Action": "passive",
		"Icon": "abilities/snare_trap.png",
		"Cooldown": "1000",
		"Target": {
			"Type": "Entity",
			"Range": "8",
			"TargetPlayers": {
				"_string": "Enemy"
			},
			"Classes": {
				"_string": "Unit"
			}
		},
		"DirectDamage": {
			"Origin": "target",
			"ApplyStatus": {
				"Snared": {
					"Duration": "4000"
				}
			}
		},
		"DestroyEntity": {
			"Origin": "caster"
		},
		"AutoTrigger": {
			"Interval": "1000"
		}
	}
};
const cmpAutoTargetAbilities = ConstructComponent(fourthEntity, "Abilities", autoTargetTemplate);
cmpAutoTargetAbilities.AutoTriggerAbility("AutoSnare");
TS_ASSERT_EQUALS(attackCalls[attackCalls.length - 1].target, secondEntity);
TS_ASSERT_EQUALS(attackCalls[attackCalls.length - 1].data.type, "AutoSnare.DirectDamage");
TS_ASSERT_EQUALS(destroyedEntity, fourthEntity);
cmpAutoTargetAbilities.OnDestroy();

const fifthTemplate = {
	"OrderedPulse": {
		"Action": "passive",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "1000",
		"Sound": "attack",
		"AutoTrigger": {
			"Interval": "1000",
			"InitialDelay": "500",
			"State": "ATTACKING"
		}
	}
};

const cmpStatefulAutoAbilities = ConstructComponent(fifthEntity, "Abilities", fifthTemplate);
TS_ASSERT(!cmpStatefulAutoAbilities.MatchesAutoTriggerState(fifthTemplate.OrderedPulse.AutoTrigger));
cmpTimer.OnUpdate({ "turnLength": 1.0 });
TS_ASSERT_EQUALS(autoPlayedSound, undefined);

autoState = "INDIVIDUAL.COMBAT.ATTACKING";
TS_ASSERT(cmpStatefulAutoAbilities.MatchesAutoTriggerState(fifthTemplate.OrderedPulse.AutoTrigger));
cmpTimer.OnUpdate({ "turnLength": 1.0 });
TS_ASSERT_EQUALS(autoPlayedSound, "attack");

AddMock(fifthEntity, IID_UnitAI, {
	"GetCurrentState": () => "",
	"GetOrders": () => [null],
	"FaceTowardsTarget": () => {}
});
TS_ASSERT(!cmpStatefulAutoAbilities.MatchesAutoTriggerState(fifthTemplate.OrderedPulse.AutoTrigger));
TS_ASSERT(!cmpStatefulAutoAbilities.IsInBattle());

AddMock(fourthEntity, IID_Position, {
	"IsInWorld": () => false
});
autoPlayedSound = undefined;
autoState = "INDIVIDUAL.COMBAT.ATTACKING";
cmpTimer.OnUpdate({ "turnLength": 1.0 });
TS_ASSERT_EQUALS(autoPlayedSound, undefined);

DeleteMock(fifthEntity, IID_Ownership);
TS_ASSERT_UNEVAL_EQUALS(cmpStatefulAutoAbilities.GetBuffTargetPlayers({
	"TargetPlayers": "Player"
}), []);

AddMock(fifthEntity, IID_Ownership, {
	"SetOwner": newOwner => spawnedOwner = newOwner
});

const targetedTemplate = {
	"DeployTrap": {
		"Action": "point-target",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "3000",
		"Target": {
			"Type": "Point",
			"Range": "4",
			"MaxRange": "20",
			"Cursor": "action-attack"
		},
		"Particles": {
			"Template": "special/effects/hero_ability_aura",
			"Origin": "target"
		},
		"SpawnEntity": {
			"Template": "units/test_trap",
			"Origin": "target",
			"Owner": "caster",
			"ActiveLimit": "3",
			"Timing": "immediate"
		},
		"AreaAttack": {
			"Origin": "target",
			"Range": "6",
			"TargetPlayers": {
				"_string": "Enemy"
			},
			"Damage": {
				"Hack": "5"
			}
		}
	},
		"MarkTarget": {
		"Action": "unit-target",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "2000",
		"Target": {
			"Type": "Entity",
			"MaxRange": "20",
			"TargetPlayers": {
				"_string": "Gaia Enemy"
			},
			"Classes": {
				"_string": "Unit"
			},
			"AllowSelf": "false"
		},
			"DirectDamage": {
				"Origin": "target",
				"Damage": {
					"Pierce": "11"
				},
				"ApplyStatus": {
					"Marked": {
						"Duration": "1500"
					}
				}
			},
			"Projectile": {
				"Speed": "100",
				"Gravity": "50",
				"LaunchPoint": {
					"@y": "3"
				}
			},
			"OwnershipChange": {
				"Origin": "target"
			},
			"Particles": {
				"Template": "special/effects/hero_ability_aura",
				"Origin": "target"
		}
	},
	"RestoreTarget": {
		"Action": "unit-target",
		"Icon": "technologies/healing_rate.png",
		"Cooldown": "6000",
		"Target": {
			"Type": "Entity",
			"MaxRange": "20",
			"TargetPlayers": {
				"_string": "Player"
			},
			"Classes": {
				"_string": "Unit Organic"
			},
			"AllowSelf": "false"
		},
		"DirectHeal": {
			"Origin": "target",
			"Amount": "25"
		}
	},
	"RadiantBurst": {
		"Action": "point-target",
		"Icon": "technologies/healing_range.png",
		"Cooldown": "12000",
		"Target": {
			"Type": "Point",
			"Range": "4",
			"MaxRange": "18"
		},
		"AreaHeal": {
			"Origin": "target",
			"Range": "7",
			"Amount": "12",
			"TargetPlayers": {
				"_string": "Player"
			}
		}
	},
	"InfiltrateTarget": {
		"Action": "unit-target",
		"Icon": "abilities/conversion.png",
		"Cooldown": "9000",
		"Target": {
			"Type": "Entity",
			"MaxRange": "20",
			"TargetPlayers": {
				"_string": "Enemy"
			},
			"Classes": {
				"_string": "Structure"
			},
			"ClassesAny": {
				"_string": "CivCentre Barter DropsiteWood DropsiteStone DropsiteMetal DropsiteFood"
			},
			"AllowSelf": "false"
		},
		"Infiltration": {
			"Duration": "5000",
			"ResourceType": "metal",
			"Amount": "10",
			"EscapeDistance": "8"
		}
	}
};

const cmpTargetedAbilities = ConstructComponent(firstEntity, "Abilities", targetedTemplate);
TS_ASSERT(cmpTargetedAbilities.CanTargetPoint(targetedTemplate.DeployTrap, { "x": 18, "z": 20 }));
TS_ASSERT(!cmpTargetedAbilities.CanTargetPoint(targetedTemplate.DeployTrap, { "x": 80, "z": 80 }));
TS_ASSERT(!cmpTargetedAbilities.CanResolvePointTarget(targetedTemplate.DeployTrap, { "x": 18, "z": 20 }));
TS_ASSERT(cmpTargetedAbilities.CanTargetEntity(targetedTemplate.MarkTarget, secondEntity));
TS_ASSERT(cmpTargetedAbilities.CanTargetEntity(targetedTemplate.MarkTarget, gaiaTargetEntity));
TS_ASSERT(!cmpTargetedAbilities.CanTargetEntity(targetedTemplate.MarkTarget, thirdEntity));
TS_ASSERT(!cmpTargetedAbilities.CanTargetEntity(targetedTemplate.MarkTarget, firstEntity));
TS_ASSERT(!cmpTargetedAbilities.CanTargetEntity(targetedTemplate.RestoreTarget, secondEntity));
TS_ASSERT(cmpTargetedAbilities.CanTargetEntity(targetedTemplate.RestoreTarget, allyTargetEntity));
casterPosition2D = new Vector2D(16, 18);
casterPosition3D = new Vector3D(16, 0, 18);
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("DeployTrap", {
	"position": { "x": 18, "z": 20 }
}));
TS_ASSERT_EQUALS(addedEntityTemplate, "units/test_trap");
TS_ASSERT_UNEVAL_EQUALS(spawnedJumpedTo, [18, 20]);
TS_ASSERT_EQUALS(spawnedOwner, owner);
TS_ASSERT_EQUALS(queryType, "point");
TS_ASSERT_UNEVAL_EQUALS(aroundQueryPosition, [18, 20]);
casterPosition2D = new Vector2D(11, 13);
casterPosition3D = new Vector3D(11, 0, 13);

infiltrationCalls.length = 0;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("InfiltrateTarget", {
	"target": enemyStructureEntity
}));
TS_ASSERT(!cmpTargetedAbilities.CanTargetEntity(targetedTemplate.InfiltrateTarget, enemyMilitaryStructureEntity));
TS_ASSERT_EQUALS(infiltrationCalls.length, 1);
TS_ASSERT_EQUALS(infiltrationCalls[0].target, enemyStructureEntity);
TS_ASSERT_EQUALS(infiltrationCalls[0].data.duration, 5000);
TS_ASSERT_EQUALS(infiltrationCalls[0].data.resourceType, "metal");
TS_ASSERT_EQUALS(infiltrationCalls[0].data.amount, 10);
TS_ASSERT_EQUALS(infiltrationCalls[0].data.escapeDistance, 8);

ownedEntities = [201, 202, 203, 204];
AddMock(201, IID_Identity, {
	"GetSelectionGroupName": () => "units/test_trap"
});
AddMock(202, IID_Identity, {
	"GetSelectionGroupName": () => "units/test_trap"
});
AddMock(203, IID_Identity, {
	"GetSelectionGroupName": () => "units/test_trap"
});
AddMock(204, IID_Identity, {
	"GetSelectionGroupName": () => "units/test_trap"
});
AddMock(201, IID_SpawnedEntity, {
	"GetSpawner": () => firstEntity
});
AddMock(202, IID_SpawnedEntity, {
	"GetSpawner": () => firstEntity
});
AddMock(203, IID_SpawnedEntity, {
	"GetSpawner": () => firstEntity
});
AddMock(204, IID_SpawnedEntity, {
	"GetSpawner": () => secondEntity
});
TS_ASSERT_EQUALS(cmpTargetedAbilities.CountActiveSpawnedEntities(targetedTemplate.DeployTrap.SpawnEntity), 3);
destroyedEntity = undefined;
addedEntityTemplate = undefined;
casterPosition2D = new Vector2D(17, 19);
casterPosition3D = new Vector3D(17, 0, 19);
cmpTimer.OnUpdate({ "turnLength": 3.0 });
TS_ASSERT(!cmpTargetedAbilities.TriggerAbility("DeployTrap", {
	"position": { "x": 18, "z": 20 }
}));
TS_ASSERT_EQUALS(addedEntityTemplate, undefined);
TS_ASSERT_EQUALS(destroyedEntity, undefined);
ownedEntities = [];
DeleteMock(201, IID_Identity);
DeleteMock(202, IID_Identity);
DeleteMock(203, IID_Identity);
DeleteMock(204, IID_Identity);
DeleteMock(201, IID_SpawnedEntity);
DeleteMock(202, IID_SpawnedEntity);
DeleteMock(203, IID_SpawnedEntity);
DeleteMock(204, IID_SpawnedEntity);
addedEntityTemplate = undefined;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("DeployTrap", {
	"position": { "x": 18, "z": 20 }
}));
TS_ASSERT_EQUALS(addedEntityTemplate, "units/test_trap");
casterPosition2D = new Vector2D(11, 13);
casterPosition3D = new Vector3D(11, 0, 13);

const targetedAttackCount = attackCalls.length;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("MarkTarget", {
	"target": secondEntity
}));
TS_ASSERT_EQUALS(facedTarget, secondEntity);
TS_ASSERT_UNEVAL_EQUALS(jumpedTo, [15, 18]);
TS_ASSERT_EQUALS(attackCalls.length, targetedAttackCount);
TS_ASSERT_EQUALS(launchedProjectile.position.x, 15);
TS_ASSERT_EQUALS(launchedProjectile.position.z, 18);
TS_ASSERT_EQUALS(launchedProjectile.speed, 100);
TS_ASSERT_EQUALS(launchedProjectile.gravity, 50);
TS_ASSERT_EQUALS(delayedHitCalls.length, 0);
cmpTimer.OnUpdate({ "turnLength": 0.1 });
TS_ASSERT_EQUALS(attackCalls.length, targetedAttackCount + 1);
TS_ASSERT_EQUALS(attackCalls[targetedAttackCount].target, secondEntity);
TS_ASSERT_EQUALS(attackCalls[targetedAttackCount].data.type, "MarkTarget.DirectDamage");
TS_ASSERT_EQUALS(attackCalls[targetedAttackCount].data.attackData.Damage.Pierce, 11);
TS_ASSERT_EQUALS(attackCalls[targetedAttackCount].data.attackData.ApplyStatus.Marked.Duration, "1500");
TS_ASSERT_EQUALS(convertedOwner, owner);
cmpTimer.OnUpdate({ "turnLength": 2.0 });
const gaiaAttackCount = attackCalls.length;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("MarkTarget", {
	"target": gaiaTargetEntity
}));
TS_ASSERT_EQUALS(facedTarget, gaiaTargetEntity);
TS_ASSERT_EQUALS(attackCalls.length, gaiaAttackCount);
cmpTimer.OnUpdate({ "turnLength": 0.1 });
TS_ASSERT_EQUALS(attackCalls.length, gaiaAttackCount + 1);
TS_ASSERT_EQUALS(attackCalls[gaiaAttackCount].target, gaiaTargetEntity);
TS_ASSERT_EQUALS(convertedOwner, owner);
TS_ASSERT(!cmpTargetedAbilities.TriggerAbility("MarkTarget", {
	"target": thirdEntity
}));
cmpTimer.OnUpdate({ "turnLength": 3.0 });
movedToPointRange = undefined;
walkedToPointRange = undefined;
addedOrders = [];
addedEntityTemplate = undefined;
spawnedJumpedTo = undefined;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("DeployTrap", {
	"position": { "x": 90, "z": 90 }
}));
TS_ASSERT_EQUALS(addedEntityTemplate, undefined);
TS_ASSERT_EQUALS(spawnedJumpedTo, undefined);
TS_ASSERT_EQUALS(walkedToPointRange.x, 90);
TS_ASSERT_EQUALS(walkedToPointRange.z, 90);
TS_ASSERT_EQUALS(walkedToPointRange.max, 4);
TS_ASSERT_EQUALS(movedToPointRange, undefined);
casterPosition2D = new Vector2D(88, 88);
casterPosition3D = new Vector3D(88, 0, 88);
cmpTimer.OnUpdate({ "turnLength": 0.2 });
TS_ASSERT_EQUALS(addedEntityTemplate, "units/test_trap");
TS_ASSERT_UNEVAL_EQUALS(spawnedJumpedTo, [90, 90]);
casterPosition2D = new Vector2D(11, 13);
casterPosition3D = new Vector3D(11, 0, 13);

addedOrders = [];
const queuedAttackCount = attackCalls.length;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("MarkTarget", {
	"target": queuedTargetEntity
}));
TS_ASSERT_EQUALS(attackCalls.length, queuedAttackCount);
TS_ASSERT_EQUALS(addedOrders.length, 1);
TS_ASSERT_EQUALS(addedOrders[0].type, "WalkToTarget");
TS_ASSERT_EQUALS(addedOrders[0].data.target, queuedTargetEntity);
TS_ASSERT_EQUALS(addedOrders[0].data.max, 20);
queuedTargetPosition2D = new Vector2D(16, 17);
queuedTargetPosition3D = new Vector3D(16, 0, 17);
cmpTimer.OnUpdate({ "turnLength": 1.0 });
cmpTimer.OnUpdate({ "turnLength": 0.1 });
TS_ASSERT_EQUALS(attackCalls.length, queuedAttackCount + 1);
TS_ASSERT_EQUALS(attackCalls[queuedAttackCount].target, queuedTargetEntity);
queuedTargetPosition2D = new Vector2D(90, 90);
queuedTargetPosition3D = new Vector3D(90, 0, 90);

healCalls.length = 0;
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("RestoreTarget", {
	"target": allyTargetEntity
}));
TS_ASSERT_EQUALS(facedTarget, allyTargetEntity);
TS_ASSERT_EQUALS(healCalls.length, 1);
TS_ASSERT_UNEVAL_EQUALS(healCalls[0], { "target": allyTargetEntity, "amount": 25 });

healCalls.length = 0;
casterPosition2D = new Vector2D(15, 17);
casterPosition3D = new Vector3D(15, 0, 17);
TS_ASSERT(cmpTargetedAbilities.TriggerAbility("RadiantBurst", {
	"position": { "x": 17, "z": 19 }
}));
TS_ASSERT_EQUALS(queryType, "point");
TS_ASSERT_UNEVAL_EQUALS(queryPlayers, [owner]);
TS_ASSERT_UNEVAL_EQUALS(aroundQueryPosition, [17, 19]);
TS_ASSERT_EQUALS(healCalls.length, 1);
TS_ASSERT_EQUALS(healCalls[0].amount, 12);
casterPosition2D = new Vector2D(11, 13);
casterPosition3D = new Vector3D(11, 0, 13);

const restrictedTemplate = {
	"ConvertTarget": {
		"Action": "unit-target",
		"Icon": "abilities/conversion.png",
		"Cooldown": "18000",
		"Target": {
			"Type": "Entity",
			"MaxRange": "22",
			"TargetPlayers": {
				"_string": "Gaia Enemy"
			},
			"Classes": {
				"_string": "Unit Organic"
			},
			"RestrictedClasses": {
				"_string": "Hero Titan"
			},
			"AllowSelf": "false"
		},
		"OwnershipChange": {
			"Origin": "target"
		}
	}
};

const cmpRestrictedAbilities = ConstructComponent(firstEntity, "Abilities", restrictedTemplate);
TS_ASSERT_UNEVAL_EQUALS(cmpRestrictedAbilities.GetAbilityStates(), [{
	"name": "ConvertTarget",
	"action": "unit-target",
	"icon": "abilities/conversion.png",
	"cooldown": 18000,
	"cooldownRemaining": 0,
	"ready": true,
	"tooltip": "",
	"animation": "",
	"animationVariant": "",
	"delay": 0,
	"cancelOnOrderChange": false,
	"autoTrigger": false,
	"autoTriggerInterval": 0,
	"target": {
		"type": "entity",
		"range": 22,
		"cursor": "",
		"previewTemplate": "",
		"players": "Gaia Enemy",
		"classes": "Unit Organic",
		"classesAny": "",
		"restrictedClasses": "Hero Titan",
		"allowSelf": false
	}
}]);
TS_ASSERT(cmpRestrictedAbilities.CanTargetEntity(restrictedTemplate.ConvertTarget, secondEntity));
TS_ASSERT(cmpRestrictedAbilities.CanTargetEntity(restrictedTemplate.ConvertTarget, gaiaTargetEntity));
TS_ASSERT(!cmpRestrictedAbilities.CanTargetEntity(restrictedTemplate.ConvertTarget, restrictedTargetEntity));
TS_ASSERT_EQUALS(cmpRestrictedAbilities.GetEntityTargetError(restrictedTemplate.ConvertTarget, restrictedTargetEntity, false), "restricted-classes");

addedLocalTemplate = undefined;
addedEntityTemplate = undefined;
playedSound = undefined;
attackCalls.length = 0;
spawnedJumpedTo = undefined;
aroundQueryPosition = undefined;

const delayedTemplate = {
	"DelayedBlast": {
		"Action": "point-target",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "4000",
		"EffectDelay": "600",
		"CancelOnOrderChange": "true",
		"Target": {
			"Type": "Point",
			"MaxRange": "20"
		},
		"Particles": {
			"Template": "special/effects/hero_ability_aura",
			"Origin": "target"
		},
			"SpawnEntity": {
				"Template": "units/test_trap",
				"Origin": "target",
				"Owner": "caster",
				"Timing": "immediate"
			},
		"AreaAttack": {
			"Origin": "target",
			"Range": "5",
			"TargetPlayers": {
				"_string": "Enemy"
			},
			"Damage": {
				"Hack": "9"
			}
		},
		"Sound": "attack"
	}
};

const cmpDelayedAbilities = ConstructComponent(firstEntity, "Abilities", delayedTemplate);
TS_ASSERT_EQUALS(cmpDelayedAbilities.GetAbilityStates()[0].delay, 600);
TS_ASSERT_EQUALS(cmpDelayedAbilities.GetAbilityStates()[0].cancelOnOrderChange, true);
TS_ASSERT(cmpDelayedAbilities.TriggerAbility("DelayedBlast", {
	"position": { "x": 17, "z": 19 }
}));
TS_ASSERT_EQUALS(cmpDelayedAbilities.GetRemainingCooldown("DelayedBlast"), 4000);
TS_ASSERT_EQUALS(addedEntityTemplate, "units/test_trap");
TS_ASSERT_UNEVAL_EQUALS(spawnedJumpedTo, [17, 19]);
TS_ASSERT_EQUALS(addedLocalTemplate, undefined);
TS_ASSERT_EQUALS(playedSound, undefined);
TS_ASSERT_EQUALS(attackCalls.length, 0);
addedEntityTemplate = undefined;
spawnedJumpedTo = undefined;

cmpTimer.OnUpdate({ "turnLength": 0.5 });
TS_ASSERT_EQUALS(addedLocalTemplate, undefined);
TS_ASSERT_EQUALS(addedEntityTemplate, undefined);
TS_ASSERT_EQUALS(playedSound, undefined);
TS_ASSERT_EQUALS(attackCalls.length, 0);

cmpTimer.OnUpdate({ "turnLength": 0.2 });
TS_ASSERT_EQUALS(addedLocalTemplate, "special/effects/hero_ability_aura");
TS_ASSERT_EQUALS(addedEntityTemplate, undefined);
TS_ASSERT_EQUALS(spawnedJumpedTo, undefined);
TS_ASSERT_UNEVAL_EQUALS(aroundQueryPosition, [17, 19]);
TS_ASSERT_EQUALS(playedSound, "attack");
TS_ASSERT_EQUALS(attackCalls.length, 1);

convertedOwner = undefined;
activeOrders = [];
const channelTemplate = {
	"Convert": {
		"Action": "unit-target",
		"Icon": "technologies/fire_arrows.png",
		"Cooldown": "4000",
		"EffectDelay": "500",
		"CancelOnOrderChange": "true",
		"Target": {
			"Type": "Entity",
			"MaxRange": "20",
			"TargetPlayers": {
				"_string": "Enemy"
			},
			"Classes": {
				"_string": "Unit"
			}
		},
		"OwnershipChange": {
			"Origin": "target"
		}
	}
};

const cmpChannelAbilities = ConstructComponent(firstEntity, "Abilities", channelTemplate);
TS_ASSERT(cmpChannelAbilities.TriggerAbility("Convert", {
	"target": secondEntity
}));
activeOrders = [{ "type": "Walk" }];
cmpTimer.OnUpdate({ "turnLength": 0.6 });
TS_ASSERT_EQUALS(convertedOwner, undefined);

TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEffectDelay(undefined), 0);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEffectDelay({ "Delay": "15" }), 15);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEffectDelay({ "EffectDelay": "25", "Delay": "15" }), 25);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetTargetRange(undefined), undefined);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetTargetRange({ "Range": "7" }), 7);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetTargetRange({ "MaxRange": "9", "Range": "7" }), 9);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetPointResolveRange(undefined), 0);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetPointResolveRange({ "Range": "7" }), 7);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetPointResolveRange({ "MaxRange": "9", "Range": "7" }), 7);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetPointResolveRange({ "MaxRange": "9" }), 9);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetNormalizedTargetType("weird"), "none");
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetTokenString({ "_string": "Player Enemy" }), "Player Enemy");

const vector2D = new Vector2D(5, 6);
TS_ASSERT_EQUALS(cmpTargetedAbilities.AsVector2D(undefined), undefined);
TS_ASSERT_EQUALS(cmpTargetedAbilities.AsVector2D(vector2D), vector2D);
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.AsVector2D({ "x": 4, "y": 8 }), new Vector2D(4, 8));

TS_ASSERT_EQUALS(cmpTargetedAbilities.GetIdentityClasses(undefined).length, 0);
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetIdentityClasses({
	"GetClassesList": () => ["Unit", "Organic"]
}), ["Unit", "Organic"]);
TS_ASSERT(cmpTargetedAbilities.HasAllIdentityClasses({
	"GetClassesList": () => ["Unit", "Organic"],
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
}, ["Unit"]));
TS_ASSERT(!cmpTargetedAbilities.HasAllIdentityClasses(undefined, ["Unit"]));
TS_ASSERT(cmpTargetedAbilities.HasAnyIdentityClass({
	"GetClassesList": () => ["Hero", "Organic"],
	"HasClass": className => ["Hero", "Organic"].indexOf(className) != -1
}, ["Hero"]));
TS_ASSERT(!cmpTargetedAbilities.HasAnyIdentityClass(undefined, ["Hero"]));

const fallbackClassTemplate = {
	"Target": {
		"Type": "Entity",
		"MaxRange": "20",
		"Classes": {
			"_string": "Unit Organic"
		},
		"RestrictedClasses": {
			"_string": "Hero"
		}
	}
};
AddMock(queuedTargetEntity, IID_Identity, {
	"GetClassesList": () => ["Unit", "Organic"],
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
});
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEntityTargetError(fallbackClassTemplate, queuedTargetEntity, true), "none");
AddMock(queuedTargetEntity, IID_Identity, {
	"GetClassesList": () => ["Unit", "Organic", "Hero"],
	"HasClass": className => ["Unit", "Organic", "Hero"].indexOf(className) != -1
});
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEntityTargetError(fallbackClassTemplate, queuedTargetEntity, true), "restricted-classes");
DeleteMock(queuedTargetEntity, IID_Identity);
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEntityTargetError(fallbackClassTemplate, queuedTargetEntity, true), "identity");
AddMock(queuedTargetEntity, IID_Identity, {
	"HasClass": className => ["Unit", "Organic"].indexOf(className) != -1
});

TS_ASSERT(cmpTargetedAbilities.IsTargetInRange({}, new Vector2D(999, 999)));
TS_ASSERT(cmpTargetedAbilities.IsPointInRange(undefined, new Vector2D(999, 999)));
AddMock(firstEntity, IID_Position, {
	"IsInWorld": () => false
});
TS_ASSERT(!cmpTargetedAbilities.IsTargetInRange({ "MaxRange": "10" }, new Vector2D(1, 1)));
TS_ASSERT(!cmpTargetedAbilities.IsPointInRange(10, new Vector2D(1, 1)));
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetCasterRotation(), 0);
AddMock(firstEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => casterPosition3D,
	"GetPosition2D": () => casterPosition2D,
	"GetRotation": () => ({ "x": 0, "y": 1.25, "z": 0 })
});
obstructionInRange = false;
TS_ASSERT(!cmpTargetedAbilities.IsEntityInRange(secondEntity, 8));
obstructionInRange = true;
TS_ASSERT(cmpTargetedAbilities.IsEntityInRange(secondEntity, 8));
obstructionInRange = false;
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEntityTargetError({
	"Target": {
		"Type": "Entity",
		"MaxRange": "8",
		"TargetPlayers": {
			"_string": "Enemy"
		},
		"Classes": {
			"_string": "Unit"
		}
	}
}, secondEntity, false), "range");
obstructionInRange = true;
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEntityTargetError({
	"Target": {
		"Type": "Entity",
		"MaxRange": "8",
		"TargetPlayers": {
			"_string": "Enemy"
		},
		"Classes": {
			"_string": "Unit"
		}
	}
}, secondEntity, false), "none");
TS_ASSERT(cmpTargetedAbilities.CanResolvePointTarget(targetedTemplate.DeployTrap, { "x": 11, "z": 16 }));
TS_ASSERT(!cmpTargetedAbilities.CanResolvePointTarget(targetedTemplate.DeployTrap, { "x": 18, "z": 20 }));

TS_ASSERT_EQUALS(cmpTargetedAbilities.SerializeTargetContext(undefined), undefined);
TS_ASSERT_EQUALS(cmpTargetedAbilities.DeserializeTargetContext(undefined), undefined);
TS_ASSERT_EQUALS(cmpTargetedAbilities.DeserializeTargetContext({ "type": "entity" }), undefined);
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.SerializeTargetContext({
	"type": "entity",
	"entity": secondEntity
}), {
	"type": "entity",
	"entity": secondEntity
});
TS_ASSERT_EQUALS(cmpTargetedAbilities.GetEffectOriginContext({}, undefined).entity, firstEntity);

TS_ASSERT(!cmpTargetedAbilities.IssueMoveToEntityRange(undefined, secondEntity, 10));
TS_ASSERT(cmpTargetedAbilities.IssueMoveToEntityRange({
	"AddOrder": (type, data, queued, pushFront) =>
	{
		addedOrders.push({ "type": type, "data": data, "queued": queued, "pushFront": pushFront });
	}
}, secondEntity, 10));
TS_ASSERT_EQUALS(addedOrders[addedOrders.length - 1].type, "WalkToTarget");
TS_ASSERT(!cmpTargetedAbilities.IssueMoveToPointRange(undefined, 1, 2, 3));
TS_ASSERT(cmpTargetedAbilities.IssueMoveToPointRange({
	"WalkToPointRange": (x, z, min, max, queued, pushFront) =>
	{
		addedOrders.push({ "type": "WalkToPointRange", "x": x, "z": z, "min": min, "max": max, "queued": queued, "pushFront": pushFront });
		return true;
	}
}, 7, 8, 9));
TS_ASSERT_EQUALS(addedOrders[addedOrders.length - 1].type, "WalkToPointRange");

DeleteMock(firstEntity, IID_UnitAI);
cmpTargetedAbilities.resetAnimationVariant = true;
cmpTargetedAbilities.ResetAnimation();
TS_ASSERT_UNEVAL_EQUALS(selectedVariant, ["animationVariant", ""]);
AddMock(firstEntity, IID_UnitAI, {
	"SetDefaultAnimationVariant": () => resetVariantCalled = true,
	"SelectAnimation": (name, once, speed) =>
	{
		resetAnimationCalled = name == "idle" && !once && speed == 1.0;
	},
	"Stop": () => activeOrders = [{ "type": "Stop" }],
	"GetCurrentState": () => autoState,
	"GetOrders": () => activeOrders,
	"AddOrder": (type, data, queued, pushFront) =>
	{
		addedOrders.push({ "type": type, "data": data, "queued": queued, "pushFront": pushFront });
	},
	"WalkToPointRange": (x, z, min, max) =>
	{
		walkedToPointRange = { "x": x, "z": z, "min": min, "max": max };
		return true;
	},
	"MoveToPointRange": (x, z, min, max) =>
	{
		movedToPointRange = { "x": x, "z": z, "min": min, "max": max };
		return true;
	},
	"FaceTowardsTarget": target => facedTarget = target
});

const originalAddLocalEntity = Engine.AddLocalEntity;
Engine.AddLocalEntity = () => INVALID_ENTITY;
cmpTargetedAbilities.SpawnParticles({ "Particles": { "Template": "special/effects/missing" } }, cmpTargetedAbilities.GetContextForEntity(secondEntity));
Engine.AddLocalEntity = originalAddLocalEntity;

const originalAddEntity = Engine.AddEntity;
Engine.AddEntity = () => INVALID_ENTITY;
cmpTargetedAbilities.SpawnEntity({ "SpawnEntity": { "Template": "units/missing", "Origin": "target" } }, { "type": "point", "position": new Vector2D(3, 4) });
Engine.AddEntity = originalAddEntity;

TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetTargetsAroundContext(undefined, 5, [enemy], IID_Health), []);
DeleteMock(SYSTEM_ENTITY, IID_RangeManager);
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetTargetsAroundContext({ "type": "point", "position": new Vector2D(1, 2) }, 5, [enemy], IID_Health), []);
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"ExecuteQuery": (entity, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		queryType = "entity";
		if (iid == IID_Health)
			return players.indexOf(owner) != -1 ? [allyTargetEntity, thirdEntity] : [secondEntity, thirdEntity];
		return [firstEntity, secondEntity, thirdEntity];
	},
	"ExecuteQueryAroundPos": (position, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		queryType = "point";
		aroundQueryPosition = [position.x, position.y];
		if (iid == IID_Health)
			return players.indexOf(owner) != -1 ? [allyTargetEntity] : [secondEntity];
		return [secondEntity];
	}
});

DeleteMock(firstEntity, IID_Ownership);
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetTargetPlayers("", "Player"), []);
AddMock(firstEntity, IID_Ownership, {
	"GetOwner": () => owner
});
AddMock(SYSTEM_ENTITY, IID_PlayerManager, {
	"GetAllPlayers": () => [0, owner, ally, enemy],
	"GetPlayerByID": () => INVALID_ENTITY
});
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetTargetPlayers("Enemy", "Player"), []);
AddMock(SYSTEM_ENTITY, IID_PlayerManager, {
	"GetAllPlayers": () => [0, owner, ally, enemy],
	"GetPlayerByID": id => ({
		[owner]: playerEntity,
		[ally]: allyPlayerEntity,
		[enemy]: enemyPlayerEntity
	}[id])
});
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetTargetPlayers("   ", "Player"), [owner]);
TS_ASSERT_UNEVAL_EQUALS(cmpTargetedAbilities.GetTargetPlayers("Gaia", "Player"), [0]);
TS_ASSERT(cmpTargetedAbilities.HasAttackEffects({ "Capture": "1" }));
TS_ASSERT(!cmpTargetedAbilities.HasAttackEffects(undefined));
TS_ASSERT(!cmpTargetedAbilities.HealEntity(undefined, 5));
TS_ASSERT(cmpTargetedAbilities.HealEntity(allyTargetEntity, 5));
TS_ASSERT(!cmpTargetedAbilities.HealEntity(thirdEntity, 5));
TS_ASSERT(!cmpTargetedAbilities.HealEntity(allyTargetEntity, 0));

cmpTargetedAbilities.animationResetTimer = 12345;
cmpTargetedAbilities.autoTriggerTimers = [11, 12];
cmpTargetedAbilities.delayedAbilityTimers = [21, 22];
cmpTargetedAbilities.queuedAbilityTimers = { "x": 31, "y": 32 };
cmpTargetedAbilities.CancelQueuedAbilityTimer("missing");
cmpTargetedAbilities.CancelAnimationResetTimer();
cmpTargetedAbilities.CancelAutoTriggerTimers();
cmpTargetedAbilities.CancelDelayedAbilityTimers();
cmpTargetedAbilities.CancelQueuedAbilityTimers();
TS_ASSERT_EQUALS(cmpTargetedAbilities.animationResetTimer, undefined);
TS_ASSERT_EQUALS(cmpTargetedAbilities.autoTriggerTimers.length, 0);
TS_ASSERT_EQUALS(cmpTargetedAbilities.delayedAbilityTimers.length, 0);
TS_ASSERT_EQUALS(Object.keys(cmpTargetedAbilities.queuedAbilityTimers).length, 0);

cmpChannelAbilities.OnDestroy();
cmpDelayedAbilities.OnDestroy();
cmpTargetedAbilities.OnDestroy();
cmpAutoAbilities.OnDestroy();
cmpStatefulAutoAbilities.OnDestroy();
TS_ASSERT_EQUALS(cmpTimer.timers.size, 0);
