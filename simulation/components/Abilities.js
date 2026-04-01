function Abilities() {}

Abilities.prototype.Schema =
	"<oneOrMore>" +
		"<element>" +
			"<anyName />" +
			"<interleave>" +
				"<element name='Action' a:help='Action type used by the GUI and command dispatcher.'>" +
					"<text/>" +
				"</element>" +
				"<element name='Icon' a:help='Icon path relative to art/textures/ui/session/portraits/.'>" +
					"<text/>" +
				"</element>" +
				"<element name='Cooldown' a:help='Cooldown in milliseconds before this ability may be used again.'>" +
					"<ref name='nonNegativeDecimal'/>" +
				"</element>" +
				"<optional>" +
					"<element name='Tooltip' a:help='Optional tooltip text shown in the GUI.'>" +
						"<text/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Animation' a:help='Optional animation name to play when the ability is triggered.'>" +
						"<text/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='AnimationVariant' a:help='Optional animation variant to apply when the ability is triggered.'>" +
						"<text/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='AnimationDuration' a:help='Optional duration in milliseconds before the animation variant is reset.'>" +
						"<ref name='nonNegativeDecimal'/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Particles' a:help='Optional local entity template spawned as a visual effect.'>" +
						"<interleave>" +
							"<element name='Template'>" +
								"<text/>" +
							"</element>" +
							"<optional>" +
								"<element name='Duration' a:help='Optional lifetime for the spawned particle effect in milliseconds.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Sound' a:help='Optional sound group name played on the owning entity when the ability is triggered.'>" +
						"<text/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Buff' a:help='Optional temporary local buff applied to nearby units when the ability is triggered.'>" +
						"<interleave>" +
							"<element name='Range' a:help='Radius in meters used to find nearby buff targets.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<element name='Duration' a:help='How long the buff lasts on each affected unit, in milliseconds.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='StatusName' a:help='Optional shared status code. Defaults to a stable per-caster ability identifier.'>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='TargetPlayers' a:help='Optional whitespace-separated relation list such as Player Ally MutualAlly Enemy.'>" +
									"<attribute name='datatype'>" +
										"<value>tokens</value>" +
									"</attribute>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='IncludeSelf' a:help='Whether the caster should also receive the buff.'>" +
									"<choice>" +
										"<value>true</value>" +
										"<value>false</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='Stackability' a:help='How repeated applications of the same status are handled.'>" +
									"<choice>" +
										"<value>Ignore</value>" +
										"<value>Extend</value>" +
										"<value>Replace</value>" +
										"<value>Stack</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								ModificationsSchema +
							"</optional>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='AreaAttack' a:help='Optional area attack that damages nearby units when the ability is triggered.'>" +
						"<interleave>" +
							"<element name='Range' a:help='Radius in meters used to find nearby attack targets.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='TargetPlayers' a:help='Optional whitespace-separated relation list such as Enemy Player Ally.'>" +
									"<attribute name='datatype'>" +
										"<value>tokens</value>" +
									"</attribute>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<element name='Damage' a:help='Direct damage applied to every affected target.'>" +
								"<oneOrMore>" +
									"<element a:help='One or more elements describing damage types'>" +
										"<anyName/>" +
										"<ref name='nonNegativeDecimal' />" +
									"</element>" +
								"</oneOrMore>" +
							"</element>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='AutoTrigger' a:help='Optional periodic auto-trigger configuration for passive hero abilities.'>" +
						"<interleave>" +
							"<element name='Interval' a:help='How often, in milliseconds, the ability should try to auto-trigger.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='InitialDelay' a:help='Optional initial delay in milliseconds before the first auto-trigger attempt.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='State' a:help='Optional UnitAI state fragment required for auto-triggering, for example COMBAT or ATTACKING.'>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
			"</interleave>" +
		"</element>" +
	"</oneOrMore>";

Abilities.prototype.Init = function()
{
	this.lastTriggered = {};
	this.animationResetTimer = undefined;
	this.resetAnimationVariant = false;
	this.autoTriggerTimers = [];
	this.StartAutoTriggers();
};

Abilities.prototype.GetAbilityNames = function()
{
	return Object.keys(this.template);
};

Abilities.prototype.GetAbilityTemplate = function(name)
{
	return this.template[name];
};

Abilities.prototype.GetCooldown = function(name)
{
	const ability = this.GetAbilityTemplate(name);
	return ability ? +ability.Cooldown : undefined;
};

Abilities.prototype.GetRemainingCooldown = function(name)
{
	const cooldown = this.GetCooldown(name);
	if (cooldown === undefined)
		return undefined;

	const lastTriggered = this.lastTriggered[name];
	if (lastTriggered === undefined)
		return 0;

	const currentTime = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	return Math.max(0, lastTriggered + cooldown - currentTime);
};

Abilities.prototype.CanTriggerAbility = function(name)
{
	return this.GetAbilityTemplate(name) && !this.GetRemainingCooldown(name);
};

Abilities.prototype.GetAbilityStates = function()
{
	return this.GetAbilityNames().map(name =>
	{
		const ability = this.GetAbilityTemplate(name);
		const cooldownRemaining = this.GetRemainingCooldown(name);
		return {
			"name": name,
			"action": ability.Action,
			"icon": ability.Icon,
			"cooldown": +ability.Cooldown,
			"cooldownRemaining": cooldownRemaining,
			"ready": cooldownRemaining === 0,
			"tooltip": ability.Tooltip || "",
			"animation": ability.Animation || "",
			"animationVariant": ability.AnimationVariant || "",
			"autoTrigger": !!ability.AutoTrigger,
			"autoTriggerInterval": ability.AutoTrigger ? +ability.AutoTrigger.Interval : 0
		};
	});
};

Abilities.prototype.TriggerAbility = function(name)
{
	const ability = this.GetAbilityTemplate(name);
	if (!ability || !this.CanTriggerAbility(name))
		return false;

	this.lastTriggered[name] = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();

	this.TriggerAnimation(ability);
	this.SpawnParticles(ability);
	this.ApplyBuff(name, ability);
	this.ApplyAreaAttack(name, ability);

	if (ability.Sound)
		PlaySound(ability.Sound, this.entity);

	return true;
};

Abilities.prototype.IsInBattle = function()
{
	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI || typeof cmpUnitAI.GetCurrentState != "function")
		return false;

	const state = cmpUnitAI.GetCurrentState();
	if (state && state.indexOf("COMBAT") != -1)
		return true;

	const orders = typeof cmpUnitAI.GetOrders == "function" ? cmpUnitAI.GetOrders() : [];
	if (!orders || !orders.length)
		return false;

	const activeOrder = orders[0];
	if (!activeOrder || !activeOrder.type)
		return false;

	return activeOrder.type == "Attack" ||
		activeOrder.type == "WalkAndFight" ||
		activeOrder.type == "Patrol";
};

Abilities.prototype.MatchesAutoTriggerState = function(autoTrigger)
{
	if (!autoTrigger || !autoTrigger.State)
		return this.IsInBattle();

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI || typeof cmpUnitAI.GetCurrentState != "function")
		return false;

	const state = cmpUnitAI.GetCurrentState();
	return typeof state == "string" && state.indexOf(autoTrigger.State) != -1;
};

Abilities.prototype.TriggerAnimation = function(ability)
{
	const cmpVisual = Engine.QueryInterface(this.entity, IID_Visual);
	if (!cmpVisual)
		return;

	this.resetAnimationVariant = !!ability.AnimationVariant;
	if (ability.AnimationVariant)
		cmpVisual.SetVariant("animationVariant", ability.AnimationVariant);

	if (ability.Animation)
		cmpVisual.SelectAnimation(ability.Animation, true, 1.0);

	if (!ability.AnimationDuration)
		return;

	this.CancelAnimationResetTimer();
	this.animationResetTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetTimeout(
		this.entity,
		IID_Abilities,
		"ResetAnimation",
		+ability.AnimationDuration,
		null);
};

Abilities.prototype.ResetAnimation = function()
{
	delete this.animationResetTimer;

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI)
	{
		if (this.resetAnimationVariant)
			cmpUnitAI.SetDefaultAnimationVariant();
		cmpUnitAI.SelectAnimation("idle", false, 1.0);
		this.resetAnimationVariant = false;
		return;
	}

	const cmpVisual = Engine.QueryInterface(this.entity, IID_Visual);
	if (!cmpVisual)
		return;

	if (this.resetAnimationVariant)
		cmpVisual.SetVariant("animationVariant", "");
	cmpVisual.SelectAnimation("idle", false, 1.0);
	this.resetAnimationVariant = false;
};

Abilities.prototype.SpawnParticles = function(ability)
{
	if (!ability.Particles || !ability.Particles.Template)
		return;

	const effectEntity = Engine.AddLocalEntity(ability.Particles.Template);
	if (!effectEntity)
		return;

	const cmpSourcePosition = Engine.QueryInterface(this.entity, IID_Position);
	const cmpEffectPosition = Engine.QueryInterface(effectEntity, IID_Position);
	if (cmpSourcePosition && cmpSourcePosition.IsInWorld() && cmpEffectPosition)
	{
		const pos = cmpSourcePosition.GetPosition();
		cmpEffectPosition.JumpTo(pos.x, pos.z);
		cmpEffectPosition.SetYRotation(cmpSourcePosition.GetRotation().y);
	}

	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const cmpEffectOwnership = Engine.QueryInterface(effectEntity, IID_Ownership);
	if (cmpOwnership && cmpEffectOwnership)
		cmpEffectOwnership.SetOwner(cmpOwnership.GetOwner());

	if (!ability.Particles.Duration)
		return;

	Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetTimeout(
		this.entity,
		IID_Abilities,
		"DestroyLocalEntity",
		+ability.Particles.Duration,
		effectEntity);
};

Abilities.prototype.ApplyBuff = function(name, ability)
{
	if (!ability.Buff)
		return;

	const players = this.GetTargetPlayers(ability.Buff.TargetPlayers, "Player");
	if (!players.length)
		return;

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager)
		return;

	const targets = cmpRangeManager.ExecuteQuery(this.entity, 0, +ability.Buff.Range, players, IID_StatusEffectsReceiver, true);
	if (!targets || !targets.length)
		return;

	const statusName = this.GetBuffStatusName(name, ability.Buff);
	const statusData = this.GetBuffStatusData(ability.Buff);
	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const owner = cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;

	for (const target of targets)
	{
		if (target == this.entity && ability.Buff.IncludeSelf == "false")
			continue;

		const cmpStatusEffectsReceiver = Engine.QueryInterface(target, IID_StatusEffectsReceiver);
		if (cmpStatusEffectsReceiver)
			cmpStatusEffectsReceiver.AddStatus(statusName, statusData, this.entity, owner);
	}
};

Abilities.prototype.GetBuffStatusName = function(name, buff)
{
	return buff.StatusName || "ability/" + this.entity + "/" + name;
};

Abilities.prototype.GetBuffStatusData = function(buff)
{
	const status = {
		"Duration": +buff.Duration,
		"Modifiers": buff.Modifiers
	};

	if (buff.Stackability)
		status.Stackability = buff.Stackability;

	return status;
};

Abilities.prototype.GetBuffTargetPlayers = function(buff)
{
	return this.GetTargetPlayers(buff.TargetPlayers, "Player");
};

Abilities.prototype.GetTargetPlayers = function(targetPlayerSpec, defaultRelations)
{
	const cmpPlayer = QueryOwnerInterface(this.entity);
	if (!cmpPlayer)
		return [];

	const owner = cmpPlayer.GetPlayerID();
	const targetPlayers = !targetPlayerSpec ? defaultRelations :
		typeof targetPlayerSpec == "string" ? targetPlayerSpec :
		targetPlayerSpec._string || defaultRelations;
	const relations = targetPlayers.split(/\s+/).filter(Boolean);
	if (!relations.length)
		return [owner];

	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	if (!cmpPlayerManager)
		return [owner];

	const cmpDiplomacy = QueryOwnerInterface(this.entity, IID_Diplomacy);
	const players = [];
	for (const player of cmpPlayerManager.GetAllPlayers())
	{
		if (relations.indexOf("Player") != -1 && player == owner ||
			cmpDiplomacy && relations.indexOf("Ally") != -1 && cmpDiplomacy.IsAlly(player) ||
			cmpDiplomacy && relations.indexOf("MutualAlly") != -1 && cmpDiplomacy.IsMutualAlly(player) ||
			cmpDiplomacy && relations.indexOf("Enemy") != -1 && cmpDiplomacy.IsEnemy(player) ||
			cmpDiplomacy && relations.indexOf("Neutral") != -1 && cmpDiplomacy.IsNeutral(player))
			players.push(player);
	}

	return players;
};

Abilities.prototype.ApplyAreaAttack = function(name, ability)
{
	if (!ability.AreaAttack || !ability.AreaAttack.Damage)
		return;

	const players = this.GetTargetPlayers(ability.AreaAttack.TargetPlayers, "Enemy");
	if (!players.length)
		return;

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager)
		return;

	const targets = cmpRangeManager.ExecuteQuery(this.entity, 0, +ability.AreaAttack.Range, players, IID_Health, true);
	if (!targets || !targets.length)
		return;

	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const owner = cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;
	const attackData = {
		"Damage": {}
	};
	for (const type in ability.AreaAttack.Damage)
		attackData.Damage[type] = +ability.AreaAttack.Damage[type];

	for (const target of targets)
		AttackHelper.HandleAttackEffects(target, {
			"type": name + ".AreaAttack",
			"attackData": attackData,
			"attacker": this.entity,
			"attackerOwner": owner
		});
};

Abilities.prototype.DestroyLocalEntity = function(entity)
{
	Engine.DestroyEntity(entity);
};

Abilities.prototype.StartAutoTriggers = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	for (const name of this.GetAbilityNames())
	{
		const autoTrigger = this.template[name].AutoTrigger;
		if (!autoTrigger || +autoTrigger.Interval <= 0)
			continue;

		this.autoTriggerTimers.push(cmpTimer.SetInterval(
			this.entity,
			IID_Abilities,
			"AutoTriggerAbility",
			+autoTrigger.InitialDelay || +autoTrigger.Interval,
			+autoTrigger.Interval,
			name));
	}
};

Abilities.prototype.AutoTriggerAbility = function(name)
{
	const ability = this.GetAbilityTemplate(name);
	if (!ability || !this.MatchesAutoTriggerState(ability.AutoTrigger))
		return;

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (cmpPosition && typeof cmpPosition.IsInWorld == "function" && !cmpPosition.IsInWorld())
		return;

	this.TriggerAbility(name);
};

Abilities.prototype.CancelAnimationResetTimer = function()
{
	if (!this.animationResetTimer)
		return;

	Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).CancelTimer(this.animationResetTimer);
	delete this.animationResetTimer;
};

Abilities.prototype.CancelAutoTriggerTimers = function()
{
	if (!this.autoTriggerTimers.length)
		return;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	for (const timer of this.autoTriggerTimers)
		cmpTimer.CancelTimer(timer);

	this.autoTriggerTimers = [];
};

Abilities.prototype.OnDestroy = function()
{
	this.CancelAnimationResetTimer();
	this.CancelAutoTriggerTimers();
};

Engine.RegisterComponentType(IID_Abilities, "Abilities", Abilities);
