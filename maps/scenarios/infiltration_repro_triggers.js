const REPRO_PLAYER = 1;
const REPRO_ENEMY = 2;
const REPRO_SABOTEUR = "units/unit_abilities/saboteur";
const REPRO_SCOUT = "units/unit_abilities/scout_settler";
const REPRO_BUZZARD_HANDLER = "units/unit_abilities/buzzard_handler";
const REPRO_BATTLE_MEDIC = "units/unit_abilities/battle_medic";
const REPRO_CHARGE_BEARER = "units/unit_abilities/charge_bearer";
const REPRO_CONVERTER = "units/unit_abilities/converter";
const REPRO_SHARPSHOOTER = "units/unit_abilities/sharpshooter";
const REPRO_SHOCK_TROOPER = "units/unit_abilities/shock_trooper";
const REPRO_TRAP_SETTER = "units/unit_abilities/trap_setter";
const REPRO_WAR_CHANTER = "units/unit_abilities/war_chanter";
const REPRO_TARGET = "structures/unit_abilities/scripted_storehouse";
const REPRO_PLAYER_CC = "structures/rome/civil_centre";
const REPRO_PLAYER_STOREHOUSE = "structures/rome/storehouse";
const REPRO_ENEMY_CC = "structures/rome/civil_centre";

function QuickSpawn(x, z, template, owner)
{
	const ent = Engine.AddEntity(template);

	const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
	if (cmpOwnership)
		cmpOwnership.SetOwner(owner);

	const cmpPosition = Engine.QueryInterface(ent, IID_Position);
	if (cmpPosition)
		cmpPosition.JumpTo(x, z);

	return ent;
}

Trigger.prototype.InfiltrationRepro_Init = function()
{
	this.reproPlayerCC = QuickSpawn(28, 184, REPRO_PLAYER_CC, REPRO_PLAYER);
	this.reproPlayerStorehouse = QuickSpawn(52, 184, REPRO_PLAYER_STOREHOUSE, REPRO_PLAYER);
	this.reproBuzzardHandler = QuickSpawn(20, 166, REPRO_BUZZARD_HANDLER, REPRO_PLAYER);
	this.reproScout = QuickSpawn(28, 166, REPRO_SCOUT, REPRO_PLAYER);
	this.reproSaboteur = QuickSpawn(36, 166, REPRO_SABOTEUR, REPRO_PLAYER);
	this.reproBattleMedic = QuickSpawn(44, 166, REPRO_BATTLE_MEDIC, REPRO_PLAYER);
	this.reproChargeBearer = QuickSpawn(52, 166, REPRO_CHARGE_BEARER, REPRO_PLAYER);
	this.reproConverter = QuickSpawn(20, 156, REPRO_CONVERTER, REPRO_PLAYER);
	this.reproSharpshooter = QuickSpawn(28, 156, REPRO_SHARPSHOOTER, REPRO_PLAYER);
	this.reproShockTrooper = QuickSpawn(36, 156, REPRO_SHOCK_TROOPER, REPRO_PLAYER);
	this.reproTrapSetter = QuickSpawn(44, 156, REPRO_TRAP_SETTER, REPRO_PLAYER);
	this.reproWarChanter = QuickSpawn(52, 156, REPRO_WAR_CHANTER, REPRO_PLAYER);
	this.reproTarget = QuickSpawn(104, 96, REPRO_TARGET, REPRO_ENEMY);
	this.reproEnemyCC = QuickSpawn(240, 96, REPRO_ENEMY_CC, REPRO_ENEMY);

	this.DoAfterDelay(1000, "InfiltrationRepro_Order", {});
};

Trigger.prototype.InfiltrationRepro_Order = function()
{
	ProcessCommand(REPRO_PLAYER, {
		"type": "ability",
		"entities": [this.reproSaboteur],
		"ability": "InfiltrateStorehouse",
		"target": this.reproTarget,
		"queued": false,
		"pushFront": false
	});
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "InfiltrationRepro_Init", { "enabled": true });
}
