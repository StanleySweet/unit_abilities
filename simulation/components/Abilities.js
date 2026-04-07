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
					"<element name='Delay' a:help='Optional delay in milliseconds before the ability effects resolve.'>" +
						"<ref name='nonNegativeDecimal'/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='CancelOnOrderChange' a:help='If true, delayed abilities are cancelled when the caster receives a different order before resolving.'>" +
						"<choice>" +
							"<value>true</value>" +
							"<value>false</value>" +
						"</choice>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Tooltip' a:help='Optional tooltip text shown in the GUI.'>" +
						"<text/>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Target' a:help='Optional targeting rules for abilities that require a second click.'>" +
						"<interleave>" +
							"<element name='Type' a:help='Entity for unit selection, Point for ground selection.'>" +
								"<choice>" +
									"<value>Entity</value>" +
									"<value>Point</value>" +
								"</choice>" +
							"</element>" +
							"<optional>" +
								"<element name='Range' a:help='Optional maximum distance from the caster to the selected target.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='Cursor' a:help='Optional cursor used while the ability target is being selected.'>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='PreviewTemplate' a:help='Optional entity template shown as a local placement preview for point-target abilities.'>" +
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
								"<element name='Classes' a:help='Optional whitespace-separated identity classes required on an entity target.'>" +
									"<attribute name='datatype'>" +
										"<value>tokens</value>" +
									"</attribute>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='AllowSelf' a:help='Whether the caster may be selected as the entity target.'>" +
									"<choice>" +
										"<value>true</value>" +
										"<value>false</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
						"</interleave>" +
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
								"<element name='Origin' a:help='Whether particles should appear on the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='Duration' a:help='Optional lifetime for the spawned particle effect in milliseconds.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='SpawnEntity' a:help='Optional entity template spawned when the ability is triggered, useful for traps and deployables.'>" +
						"<interleave>" +
							"<element name='Template'>" +
								"<text/>" +
							"</element>" +
							"<optional>" +
								"<element name='Origin' a:help='Whether to spawn the entity on the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='Owner' a:help='Owner of the spawned entity.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>gaia</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='Duration' a:help='Optional lifetime for the spawned entity in milliseconds.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='Timing' a:help='Whether the entity should spawn immediately on click or after the ability delay elapses.'>" +
									"<choice>" +
										"<value>immediate</value>" +
										"<value>delayed</value>" +
									"</choice>" +
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
								"<element name='Origin' a:help='Whether the buff query should be centered on the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
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
								"<element name='Origin' a:help='Whether the area attack should be centered on the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
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
					"<element name='DirectDamage' a:help='Optional direct attack damage applied to a single entity when the ability is triggered.'>" +
						"<interleave>" +
							"<optional>" +
								"<element name='Origin' a:help='Whether the direct attack should hit the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<element name='Damage' a:help='Direct damage applied to the selected entity.'>" +
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
					"<element name='OwnershipChange' a:help='Optional ownership transfer applied to a single entity when the ability is triggered.'>" +
						"<interleave>" +
							"<optional>" +
								"<element name='Origin' a:help='Whether the ownership change should apply to the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
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
	this.delayedAbilityTimers = [];
	this.queuedAbilityTimers = {};
	this.nextQueuedAbilityToken = 1;
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

Abilities.prototype.GetTargetState = function(target)
{
	if (!target)
		return {
			"type": "none"
		};

	const targetType = this.GetNormalizedTargetType(target.Type);
		return {
			"type": targetType,
			"range": target.Range !== undefined ? +target.Range : 0,
			"cursor": target.Cursor || "",
			"previewTemplate": target.PreviewTemplate || "",
			"players": this.GetTokenString(target.TargetPlayers),
			"classes": this.GetTokenString(target.Classes),
			"allowSelf": target.AllowSelf !== "false"
	};
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
			"delay": ability.Delay ? +ability.Delay : 0,
			"cancelOnOrderChange": ability.CancelOnOrderChange == "true",
			"autoTrigger": !!ability.AutoTrigger,
			"autoTriggerInterval": ability.AutoTrigger ? +ability.AutoTrigger.Interval : 0,
			"target": this.GetTargetState(ability.Target)
		};
	});
};

Abilities.prototype.TriggerAbility = function(name, data)
{
	const ability = this.GetAbilityTemplate(name);
	if (!ability || !this.CanTriggerAbility(name))
		return false;

	if (data)
		this.CancelQueuedAbilityTimers();

	const targetContext = this.ResolveTargetContext(ability, data);
	if (!targetContext)
		return this.TryQueueAbilityInRange(name, ability, data);

	this.lastTriggered[name] = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();

	this.PrepareDelayedAbility(ability);
	this.TriggerAnimation(ability);
	this.ExecuteImmediateAbilityEffects(name, ability, targetContext);
	this.ScheduleAbilityExecution(name, ability, targetContext);

	return true;
};

Abilities.prototype.TryQueueAbilityInRange = function(name, ability, data)
{
	if (this.GetNormalizedTargetType(ability.Target && ability.Target.Type) != "entity" || !data || !data.target)
		return false;

	if (this.GetEntityTargetError(ability, data.target, false) != "range")
		return false;

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI || typeof cmpUnitAI.MoveToTargetRangeExplicit != "function")
		return false;

	if (!cmpUnitAI.MoveToTargetRangeExplicit(data.target, 0, +ability.Target.Range))
		return false;

	this.QueueAbilityRetry(name, data.target);
	return true;
};

Abilities.prototype.QueueAbilityRetry = function(name, target)
{
	const token = String(this.nextQueuedAbilityToken++);
	this.queuedAbilityTimers[token] = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetInterval(
		this.entity,
		IID_Abilities,
		"ProcessQueuedAbility",
		200,
		200,
		{
			"token": token,
			"name": name,
			"target": target,
			"expires": Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() + 15000
		});
};

Abilities.prototype.ProcessQueuedAbility = function(data, lateness)
{
	if (!data || !data.token || !this.queuedAbilityTimers[data.token])
		return;

	const ability = this.GetAbilityTemplate(data.name);
	if (!ability)
	{
		this.CancelQueuedAbilityTimer(data.token);
		return;
	}

	const currentTime = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	if (currentTime >= data.expires)
	{
		this.CancelQueuedAbilityTimer(data.token);
		return;
	}

	const targetError = this.GetEntityTargetError(ability, data.target, true);
	if (targetError != "none" && targetError != "range")
	{
		this.CancelQueuedAbilityTimer(data.token);
		return;
	}

	const targetContext = this.ResolveTargetContext(ability, { "target": data.target });
	if (!targetContext)
		return;

	this.CancelQueuedAbilityTimer(data.token);
	if (!this.CanTriggerAbility(data.name))
		return;

	this.lastTriggered[data.name] = currentTime;
	this.PrepareDelayedAbility(ability);
	this.TriggerAnimation(ability);
	this.ExecuteImmediateAbilityEffects(data.name, ability, targetContext);
	this.ScheduleAbilityExecution(data.name, ability, targetContext);
};

Abilities.prototype.PrepareDelayedAbility = function(ability)
{
	if (!ability || ability.CancelOnOrderChange != "true" || !(ability.Delay > 0))
		return;

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI && typeof cmpUnitAI.Stop == "function")
		cmpUnitAI.Stop(false);
};

Abilities.prototype.ExecuteImmediateAbilityEffects = function(name, ability, targetContext)
{
	if (this.IsImmediateSpawnEntity(ability))
		this.SpawnEntity(ability, targetContext);
};

Abilities.prototype.ScheduleAbilityExecution = function(name, ability, targetContext)
{
	const delay = ability.Delay ? +ability.Delay : 0;
	if (delay <= 0)
	{
		this.ExecuteAbilityEffects(name, ability, targetContext);
		return;
	}

	const timer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetTimeout(
		this.entity,
		IID_Abilities,
		"ExecuteDelayedAbility",
		delay,
		{
			"name": name,
			"targetContext": this.SerializeTargetContext(targetContext),
			"cancelOnOrderChange": ability.CancelOnOrderChange == "true"
		});
	this.delayedAbilityTimers.push(timer);
};

Abilities.prototype.ExecuteDelayedAbility = function(data, lateness)
{
	const ability = this.GetAbilityTemplate(data.name);
	if (!ability)
		return;

	if (data.cancelOnOrderChange && !this.CanResolveDelayedAbility())
		return;

	const targetContext = this.DeserializeTargetContext(data.targetContext);
	if (!targetContext)
		return;

	this.ExecuteAbilityEffects(data.name, ability, targetContext);
};

Abilities.prototype.CanResolveDelayedAbility = function()
{
	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI || typeof cmpUnitAI.GetOrders != "function")
		return true;

	const orders = cmpUnitAI.GetOrders();
	if (!orders || !orders.length)
		return true;

	const activeOrder = orders[0];
	return !!activeOrder && activeOrder.type == "Stop";
};

Abilities.prototype.ExecuteAbilityEffects = function(name, ability, targetContext)
{
	this.SpawnParticles(ability, targetContext);
	if (!this.IsImmediateSpawnEntity(ability))
		this.SpawnEntity(ability, targetContext);
	this.ApplyBuff(name, ability, targetContext);
	this.ApplyDirectDamage(name, ability, targetContext);
	this.ApplyOwnershipChange(ability, targetContext);
	this.ApplyAreaAttack(name, ability, targetContext);

	if (ability.Sound)
		PlaySound(ability.Sound, this.entity);
};

Abilities.prototype.SerializeTargetContext = function(targetContext)
{
	if (!targetContext)
		return undefined;

	if (targetContext.type == "point")
		return {
			"type": "point",
			"position": {
				"x": targetContext.position.x,
				"z": targetContext.position.y !== undefined ? targetContext.position.y : targetContext.position.z
			}
		};

	if (targetContext.entity !== undefined)
		return {
			"type": targetContext.type,
			"entity": targetContext.entity
		};

	return undefined;
};

Abilities.prototype.DeserializeTargetContext = function(targetContext)
{
	if (!targetContext)
		return undefined;

	if (targetContext.type == "point")
		return {
			"type": "point",
			"position": this.AsVector2D(targetContext.position)
		};

	if (targetContext.entity === undefined)
		return undefined;

	return this.GetContextForEntity(targetContext.entity);
};

Abilities.prototype.IsImmediateSpawnEntity = function(ability)
{
	return !!(ability && ability.SpawnEntity && ability.SpawnEntity.Template && ability.SpawnEntity.Timing == "immediate");
};

Abilities.prototype.GetNormalizedTargetType = function(type)
{
	if (!type)
		return "none";

	const normalized = String(type).toLowerCase();
	if (normalized == "entity" || normalized == "point")
		return normalized;

	return "none";
};

Abilities.prototype.GetTokenString = function(value)
{
	if (!value)
		return "";

	if (typeof value == "string")
		return value;

	return value._string || "";
};

Abilities.prototype.AsVector2D = function(position)
{
	if (!position)
		return undefined;

	if (typeof Vector2D != "undefined" && position.constructor != Vector2D)
		return new Vector2D(position.x, position.z !== undefined ? position.z : position.y);

	return position;
};

Abilities.prototype.GetEntityPosition = function(entity)
{
	const cmpPosition = Engine.QueryInterface(entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return undefined;

	if (typeof cmpPosition.GetPosition2D == "function")
		return cmpPosition.GetPosition2D();

	const pos = cmpPosition.GetPosition();
	return this.AsVector2D({ "x": pos.x, "z": pos.z });
};

Abilities.prototype.GetContextForEntity = function(entity)
{
	const position = this.GetEntityPosition(entity);
	if (!position)
		return undefined;

	return {
		"type": entity == this.entity ? "caster" : "entity",
		"entity": entity,
		"position": position
	};
};

Abilities.prototype.ResolveTargetContext = function(ability, data)
{
	const targetType = this.GetNormalizedTargetType(ability.Target && ability.Target.Type);
	if (targetType == "none")
		return this.GetContextForEntity(this.entity);

	if (targetType == "entity")
	{
		const target = data && data.target;
		if (!this.CanTargetEntity(ability, target))
			return undefined;

		return this.GetContextForEntity(target);
	}

	const position = data && data.position;
	if (!this.CanTargetPoint(ability, position))
		return undefined;

	return {
		"type": "point",
		"position": this.AsVector2D(position)
	};
};

Abilities.prototype.CanTargetEntity = function(ability, target)
{
	return this.GetEntityTargetError(ability, target, false) == "none";
};

Abilities.prototype.GetEntityTargetError = function(ability, target, ignoreRange)
{
	if (!target)
		return "target";

	if (target == this.entity && (!ability.Target || ability.Target.AllowSelf == "false"))
		return "self";

	const targetPosition = this.GetEntityPosition(target);
	if (!targetPosition)
		return "position";

	if (!ignoreRange && !this.IsTargetInRange(ability.Target, targetPosition))
		return "range";

	const targetPlayers = this.GetTargetPlayers(ability.Target && ability.Target.TargetPlayers, "Player Ally Enemy MutualAlly Neutral");
	if (targetPlayers.length)
	{
		const cmpOwnership = Engine.QueryInterface(target, IID_Ownership);
		if (!cmpOwnership || targetPlayers.indexOf(cmpOwnership.GetOwner()) == -1)
			return "players";
	}

	const requiredClasses = this.GetTokenString(ability.Target && ability.Target.Classes).split(/\s+/).filter(Boolean);
	if (!requiredClasses.length)
		return "none";

	const cmpIdentity = Engine.QueryInterface(target, IID_Identity);
	if (!cmpIdentity)
		return "identity";

	return requiredClasses.every(className => cmpIdentity.HasClass(className)) ? "none" : "classes";
};

Abilities.prototype.CanTargetPoint = function(ability, position)
{
	if (!position)
		return false;

	return this.IsTargetInRange(ability.Target, this.AsVector2D(position));
};

Abilities.prototype.IsTargetInRange = function(target, position)
{
	if (!target || target.Range === undefined)
		return true;

	const sourcePosition = this.GetEntityPosition(this.entity);
	if (!sourcePosition || !position)
		return false;

	return sourcePosition.distanceTo(this.AsVector2D(position)) <= +target.Range;
};

Abilities.prototype.GetEffectOriginContext = function(effect, targetContext)
{
	if (effect && effect.Origin == "target" && targetContext && targetContext.position)
		return targetContext;

	return this.GetContextForEntity(this.entity);
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

Abilities.prototype.GetCasterRotation = function()
{
	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return 0;

	return cmpPosition.GetRotation().y;
};

Abilities.prototype.SpawnParticles = function(ability, targetContext)
{
	if (!ability.Particles || !ability.Particles.Template)
		return;

	const effectEntity = Engine.AddLocalEntity(ability.Particles.Template);
	if (!effectEntity)
		return;

	const origin = this.GetEffectOriginContext(ability.Particles, targetContext);
	const cmpEffectPosition = Engine.QueryInterface(effectEntity, IID_Position);
	if (origin && origin.position && cmpEffectPosition)
	{
		cmpEffectPosition.JumpTo(origin.position.x, origin.position.y !== undefined ? origin.position.y : origin.position.z);
		cmpEffectPosition.SetYRotation(this.GetCasterRotation());
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

Abilities.prototype.SpawnEntity = function(ability, targetContext)
{
	if (!ability.SpawnEntity || !ability.SpawnEntity.Template)
		return;

	const origin = this.GetEffectOriginContext(ability.SpawnEntity, targetContext);
	if (!origin || !origin.position)
		return;

	const entity = Engine.AddEntity(ability.SpawnEntity.Template);
	if (!entity || entity == INVALID_ENTITY)
		return;

	const cmpPosition = Engine.QueryInterface(entity, IID_Position);
	if (cmpPosition)
	{
		cmpPosition.JumpTo(origin.position.x, origin.position.y !== undefined ? origin.position.y : origin.position.z);
		cmpPosition.SetYRotation(this.GetCasterRotation());
	}

	const cmpOwnership = Engine.QueryInterface(entity, IID_Ownership);
	if (cmpOwnership)
	{
		let owner = 0;
		if (ability.SpawnEntity.Owner != "gaia")
		{
			const cmpCasterOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
			if (cmpCasterOwnership)
				owner = cmpCasterOwnership.GetOwner();
		}
		cmpOwnership.SetOwner(owner);
	}

	if (!ability.SpawnEntity.Duration)
		return;

	Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetTimeout(
		this.entity,
		IID_Abilities,
		"DestroyEntity",
		+ability.SpawnEntity.Duration,
		entity);
};

Abilities.prototype.GetTargetsAroundContext = function(context, radius, players, iid)
{
	if (!context || !context.position || !players.length)
		return [];

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager)
		return [];

	if (context.entity !== undefined && context.type != "point")
		return cmpRangeManager.ExecuteQuery(context.entity, 0, radius, players, iid, true);

	return cmpRangeManager.ExecuteQueryAroundPos(context.position, 0, radius, players, iid, true);
};

Abilities.prototype.ApplyBuff = function(name, ability, targetContext)
{
	if (!ability.Buff)
		return;

	const players = this.GetTargetPlayers(ability.Buff.TargetPlayers, "Player");
	if (!players.length)
		return;

	const origin = this.GetEffectOriginContext(ability.Buff, targetContext);
	const targets = this.GetTargetsAroundContext(origin, +ability.Buff.Range, players, IID_StatusEffectsReceiver);
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
	if (relations.indexOf("Gaia") != -1)
		players.push(0);

	for (const player of cmpPlayerManager.GetAllPlayers())
	{
		if (player === 0)
			continue;

		if (relations.indexOf("Player") != -1 && player == owner ||
			cmpDiplomacy && relations.indexOf("Ally") != -1 && cmpDiplomacy.IsAlly(player) ||
			cmpDiplomacy && relations.indexOf("MutualAlly") != -1 && cmpDiplomacy.IsMutualAlly(player) ||
			cmpDiplomacy && relations.indexOf("Enemy") != -1 && cmpDiplomacy.IsEnemy(player) ||
			cmpDiplomacy && relations.indexOf("Neutral") != -1 && cmpDiplomacy.IsNeutral(player))
			players.push(player);
	}

	return players;
};

Abilities.prototype.ApplyAreaAttack = function(name, ability, targetContext)
{
	if (!ability.AreaAttack || !ability.AreaAttack.Damage)
		return;

	const players = this.GetTargetPlayers(ability.AreaAttack.TargetPlayers, "Enemy");
	if (!players.length)
		return;

	const origin = this.GetEffectOriginContext(ability.AreaAttack, targetContext);
	const targets = this.GetTargetsAroundContext(origin, +ability.AreaAttack.Range, players, IID_Health);
	if (!targets || !targets.length)
		return;

	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const owner = cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;
	const attackData = this.BuildAttackData(ability.AreaAttack.Damage);

	for (const target of targets)
		AttackHelper.HandleAttackEffects(target, {
			"type": name + ".AreaAttack",
			"attackData": attackData,
			"attacker": this.entity,
			"attackerOwner": owner
		});
};

Abilities.prototype.ApplyDirectDamage = function(name, ability, targetContext)
{
	if (!ability.DirectDamage || !ability.DirectDamage.Damage)
		return;

	const origin = this.GetEffectOriginContext(ability.DirectDamage, targetContext);
	if (!origin || origin.entity === undefined)
		return;

	const cmpHealth = Engine.QueryInterface(origin.entity, IID_Health);
	if (!cmpHealth)
		return;

	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const owner = cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;
	const attackData = this.BuildAttackData(ability.DirectDamage.Damage);

	AttackHelper.HandleAttackEffects(origin.entity, {
		"type": name + ".DirectDamage",
		"attackData": attackData,
		"attacker": this.entity,
		"attackerOwner": owner
	});
};

Abilities.prototype.ApplyOwnershipChange = function(ability, targetContext)
{
	if (!ability.OwnershipChange)
		return;

	const origin = this.GetEffectOriginContext(ability.OwnershipChange, targetContext);
	if (!origin || origin.entity === undefined || origin.entity == this.entity)
		return;

	const cmpTargetOwnership = Engine.QueryInterface(origin.entity, IID_Ownership);
	const cmpCasterOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	if (!cmpTargetOwnership || !cmpCasterOwnership)
		return;

	cmpTargetOwnership.SetOwner(cmpCasterOwnership.GetOwner());
};

Abilities.prototype.BuildAttackData = function(damageTemplate)
{
	const attackData = {
		"Damage": {}
	};
	for (const type in damageTemplate)
		attackData.Damage[type] = +damageTemplate[type];

	return attackData;
};

Abilities.prototype.DestroyLocalEntity = function(entity)
{
	Engine.DestroyEntity(entity);
};

Abilities.prototype.DestroyEntity = function(entity)
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

Abilities.prototype.CancelDelayedAbilityTimers = function()
{
	if (!this.delayedAbilityTimers.length)
		return;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	for (const timer of this.delayedAbilityTimers)
		cmpTimer.CancelTimer(timer);

	this.delayedAbilityTimers = [];
};

Abilities.prototype.CancelQueuedAbilityTimer = function(token)
{
	if (!this.queuedAbilityTimers[token])
		return;

	Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).CancelTimer(this.queuedAbilityTimers[token]);
	delete this.queuedAbilityTimers[token];
};

Abilities.prototype.CancelQueuedAbilityTimers = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	for (const token in this.queuedAbilityTimers)
		cmpTimer.CancelTimer(this.queuedAbilityTimers[token]);

	this.queuedAbilityTimers = {};
};

Abilities.prototype.OnDestroy = function()
{
	this.CancelAnimationResetTimer();
	this.CancelAutoTriggerTimers();
	this.CancelDelayedAbilityTimers();
	this.CancelQueuedAbilityTimers();
};

Engine.RegisterComponentType(IID_Abilities, "Abilities", Abilities);
