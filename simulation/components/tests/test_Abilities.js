Engine.LoadHelperScript("Player.js");
Engine.LoadHelperScript("Sound.js");
const attackCalls = [];
Engine.RegisterGlobal("AttackHelper", {
	"HandleAttackEffects": (target, data) => attackCalls.push({ "target": target, "data": data })
});
Engine.LoadComponentScript("interfaces/Abilities.js");
Engine.LoadComponentScript("interfaces/Diplomacy.js");
Engine.LoadComponentScript("interfaces/Health.js");
Engine.LoadComponentScript("interfaces/Player.js");
Engine.LoadComponentScript("interfaces/PlayerManager.js");
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
let playedSound = undefined;
let selectedAnimation = undefined;
let selectedOnce = undefined;
let selectedSpeed = undefined;
let selectedVariant = undefined;
let jumpedTo = undefined;
let rotatedTo = undefined;
let effectOwner = undefined;
let resetVariantCalled = false;
let resetAnimationCalled = false;
let autoOrders = [];
let autoState = "INDIVIDUAL.IDLE";
let statusCalls = [];
let queryPlayers = undefined;

AddMock(SYSTEM_ENTITY, IID_PlayerManager, {
	"GetAllPlayers": () => [owner, ally, enemy],
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

Engine.DestroyEntity = entity =>
{
	destroyedEntity = entity;
};

AddMock(firstEntity, IID_Sound, {
	"PlaySoundGroup": name => playedSound = name
});

AddMock(firstEntity, IID_Ownership, {
	"GetOwner": () => owner
});

AddMock(playerEntity, IID_Diplomacy, {
	"IsAlly": player => player == ally,
	"IsMutualAlly": player => player == ally,
	"IsEnemy": player => player == enemy,
	"IsNeutral": () => false
});

AddMock(firstEntity, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition": () => ({ "x": 11, "y": 0, "z": 13 }),
	"GetRotation": () => ({ "x": 0, "y": 1.25, "z": 0 })
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
	}
});

AddMock(localEffectEntity, IID_Position, {
	"JumpTo": (x, z) => jumpedTo = [x, z],
	"SetYRotation": y => rotatedTo = y
});

AddMock(localEffectEntity, IID_Ownership, {
	"SetOwner": newOwner => effectOwner = newOwner
});

AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"ExecuteQuery": (entity, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		if (iid == IID_Health)
			return [secondEntity, thirdEntity];
		return [firstEntity, secondEntity, thirdEntity];
	}
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
	"TakeDamage": () => ({ "healthChange": -1 })
});

AddMock(thirdEntity, IID_Health, {
	"TakeDamage": () => ({ "healthChange": -1 })
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
				"_string": "Enemy"
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
	"autoTrigger": false,
	"autoTriggerInterval": 0
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
	"autoTrigger": false,
	"autoTriggerInterval": 0
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
TS_ASSERT_UNEVAL_EQUALS(queryPlayers, [owner]);
TS_ASSERT_EQUALS(statusCalls.length, 2);
TS_ASSERT_EQUALS(statusCalls[0].target, firstEntity);
TS_ASSERT_EQUALS(statusCalls[0].code, "ability/101/BattleCry");
TS_ASSERT_EQUALS(statusCalls[0].data.Duration, 3000);
TS_ASSERT_EQUALS(statusCalls[0].data.Stackability, "Replace");
TS_ASSERT_EQUALS(statusCalls[0].data.Modifiers, firstTemplate.BattleCry.Buff.Modifiers);
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
TS_ASSERT_UNEVAL_EQUALS(secondEntityVariant, ["animationVariant", ""]);
TS_ASSERT_UNEVAL_EQUALS(secondEntityAnimation, ["idle", false, 1.0]);
TS_ASSERT_EQUALS(cmpAbilitiesWithoutUnitAI.GetBuffStatusName("HeroicPose", { }), "ability/102/HeroicPose");
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

Engine.AddLocalEntity = template => localEffectEntity;
cmpAbilitiesWithoutVisual.SpawnParticles(thirdTemplate.NoFx);
TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetBuffTargetPlayers({
	"TargetPlayers": {
		"_string": "Player Ally Enemy"
	}
}), [owner, ally, enemy]);
TS_ASSERT_UNEVAL_EQUALS(cmpAbilities.GetTargetPlayers({
	"_string": "Enemy"
}, "Player"), [enemy]);
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { "Buff": { "Range": "10", "Duration": "1000", "Modifiers": {} } });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { "AreaAttack": { "Range": "10", "Damage": { "Hack": "2" } } });
DeleteMock(SYSTEM_ENTITY, IID_RangeManager);
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { "Buff": { "Range": "10", "Duration": "1000", "Modifiers": {} } });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { "AreaAttack": { "Range": "10", "Damage": { "Hack": "2" } } });
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"ExecuteQuery": () => []
});
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { "Buff": { "Range": "10", "Duration": "1000", "Modifiers": {} } });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { "AreaAttack": { "Range": "10", "Damage": { "Hack": "2" } } });
cmpAbilitiesWithoutVisual.ApplyBuff("NoFx", { });
cmpAbilitiesWithoutVisual.ApplyAreaAttack("NoFx", { });
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"ExecuteQuery": (entity, min, max, players, iid, accountForSize) =>
	{
		queryPlayers = players;
		if (iid == IID_Health)
			return [secondEntity, thirdEntity];
		return [firstEntity, secondEntity, thirdEntity];
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
	"GetOrders": () => autoOrders
});

AddMock(fourthEntity, IID_Position, {
	"IsInWorld": () => true
});

AddMock(fifthEntity, IID_Sound, {
	"PlaySoundGroup": name => autoPlayedSound = name
});

AddMock(fifthEntity, IID_UnitAI, {
	"GetCurrentState": () => autoState,
	"GetOrders": () => autoOrders
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
	"autoTrigger": true,
	"autoTriggerInterval": 1000
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
	"GetCurrentState": () => ({ }),
	"GetOrders": () => [null]
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

cmpAutoAbilities.OnDestroy();
cmpStatefulAutoAbilities.OnDestroy();
TS_ASSERT_EQUALS(cmpTimer.timers.size, 0);
