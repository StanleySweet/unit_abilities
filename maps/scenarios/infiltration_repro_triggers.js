const REPRO_PLAYER = 1;
const REPRO_ENEMY = 2;
const REPRO_SABOTEUR = "units/unit_abilities/saboteur";
const REPRO_TARGET = "structures/unit_abilities/scripted_storehouse";
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
	this.reproSaboteur = QuickSpawn(92, 96, REPRO_SABOTEUR, REPRO_PLAYER);
	this.reproTarget = QuickSpawn(104, 96, REPRO_TARGET, REPRO_ENEMY);
	this.reproEnemyCC = QuickSpawn(240, 96, REPRO_ENEMY_CC, REPRO_ENEMY);

	warn(
		"Infiltration repro: spawned saboteur " + this.reproSaboteur +
		", target " + this.reproTarget +
		", and civic centre " + this.reproEnemyCC
	);

	this.DoAfterDelay(1000, "InfiltrationRepro_Order", {});
	this.DoRepeatedly(500, "InfiltrationRepro_LogState", {}, 500);
};

Trigger.prototype.InfiltrationRepro_Order = function()
{
	warn("Infiltration repro: issuing ability order");
	ProcessCommand(REPRO_PLAYER, {
		"type": "ability",
		"entities": [this.reproSaboteur],
		"ability": "InfiltrateStorehouse",
		"target": this.reproTarget,
		"queued": false,
		"pushFront": false
	});
};

Trigger.prototype.InfiltrationRepro_LogState = function()
{
	const cmpPosition = Engine.QueryInterface(this.reproSaboteur, IID_Position);
	const cmpInfiltrator = Engine.QueryInterface(this.reproSaboteur, IID_Infiltrator);
	const cmpUnitAI = Engine.QueryInterface(this.reproSaboteur, IID_UnitAI);
	const cmpInfiltrationManager = typeof IID_InfiltrationManager == "undefined" ? null :
		Engine.QueryInterface(SYSTEM_ENTITY, IID_InfiltrationManager);

	const inWorld = !!cmpPosition && cmpPosition.IsInWorld();
	const pos = inWorld ? cmpPosition.GetPosition2D() : undefined;
	const progress = cmpInfiltrationManager ? cmpInfiltrationManager.GetTargetProgress(this.reproTarget) : 0;
	const infiltrating = cmpInfiltrator ? cmpInfiltrator.IsInfiltrating() : false;
	const orders = cmpUnitAI && typeof cmpUnitAI.GetOrders == "function" ? cmpUnitAI.GetOrders() : [];

	warn(
		"Infiltration repro state: " +
		uneval({
			"inWorld": inWorld,
			"position": pos ? { "x": pos.x, "y": pos.y } : null,
			"infiltrating": infiltrating,
			"targetProgress": progress,
			"orders": orders
		})
	);
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "InfiltrationRepro_Init", { "enabled": true });
}
