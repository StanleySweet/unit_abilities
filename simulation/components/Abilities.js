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
					"<element name='EffectDelay' a:help='Upstream-style alias for Delay, in milliseconds before the ability effects resolve.'>" +
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
								"<element name='Range' a:help='Optional targeting distance. For point targets with MaxRange, this becomes the required resolve distance once the caster reaches the point.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='MaxRange' a:help='Upstream-style alias for the maximum targeting distance from the caster.'>" +
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
								"<element name='PreviewAngleOffset' a:help='Optional preview rotation offset in radians applied on top of the aimed point direction.'>" +
									"<data type='decimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='AutoMove' a:help='Whether the caster may automatically walk into range for this target when triggered out of range.'>" +
									"<choice>" +
										"<value>true</value>" +
										"<value>false</value>" +
									"</choice>" +
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
									"<element name='ClassesAny' a:help='Optional whitespace-separated identity classes where the target must match at least one.'>" +
										"<attribute name='datatype'>" +
											"<value>tokens</value>" +
										"</attribute>" +
										"<text/>" +
									"</element>" +
								"</optional>" +
								"<optional>" +
									"<element name='RestrictedClasses' a:help='Optional whitespace-separated identity classes that disqualify an entity target.'>" +
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
								"<element name='ActiveLimit' a:help='Optional cap on how many spawned entities of the same template this caster may have active at once. Additional placements are blocked until one of the active entities is gone.'>" +
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
							AttackHelper.BuildAttackEffectsSchema() +
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
							AttackHelper.BuildAttackEffectsSchema() +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='DirectHeal' a:help='Optional direct heal applied to a single entity when the ability is triggered.'>" +
						"<interleave>" +
							"<element name='Amount' a:help='Hitpoints restored to the chosen target.'>" +
								"<ref name='positiveDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='Origin' a:help='Whether the direct heal should apply to the caster or the chosen target.'>" +
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
					"<element name='AreaHeal' a:help='Optional area heal that restores nearby units when the ability is triggered.'>" +
						"<interleave>" +
							"<element name='Range' a:help='Radius in meters used to find nearby heal targets.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<element name='Amount' a:help='Hitpoints restored to each target found in range.'>" +
								"<ref name='positiveDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='Origin' a:help='Whether the area heal should be centered on the caster or the chosen target.'>" +
									"<choice>" +
										"<value>caster</value>" +
										"<value>target</value>" +
									"</choice>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='TargetPlayers' a:help='Optional whitespace-separated relation list such as Player Ally MutualAlly.'>" +
									"<attribute name='datatype'>" +
										"<value>tokens</value>" +
									"</attribute>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='IncludeSelf' a:help='Whether the caster may also be healed by the area effect.'>" +
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
					"<element name='Infiltration' a:help='Optional fake infiltration that locks the unit in place for a duration, then grants stolen loot.'>" +
						"<interleave>" +
							"<element name='Duration' a:help='How long the infiltration takes, in milliseconds.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<element name='ResourceType' a:help='Generic resource type granted to the infiltrator when the theft completes.'>" +
								"<text/>" +
							"</element>" +
							"<element name='Amount' a:help='How much stolen loot is carried after a successful infiltration.'>" +
								"<ref name='positiveDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='EscapeDistance' a:help='How far from the building the infiltrator should reappear once the theft completes.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='Projectile' a:help='Optional projectile presentation for direct damage abilities, resolving damage on impact instead of instantly.'>" +
						"<interleave>" +
							"<element name='Speed' a:help='Projectile speed in meters per second.'>" +
								"<ref name='positiveDecimal'/>" +
							"</element>" +
							"<element name='Gravity' a:help='Projectile gravity affecting the flight arc.'>" +
								"<ref name='nonNegativeDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='LaunchPoint' a:help='Delta from the caster position where to launch the projectile.'>" +
									"<attribute name='y'>" +
										"<data type='decimal'/>" +
									"</attribute>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='ActorName' a:help='Actor of the projectile animation.'>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='ImpactActorName' a:help='Actor of the projectile impact animation.'>" +
									"<text/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='ImpactAnimationLifetime' a:help='Length of the projectile impact animation.'>" +
									"<ref name='positiveDecimal'/>" +
								"</element>" +
							"</optional>" +
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
					"<element name='DestroyEntity' a:help='Optional entity destruction applied to the caster or chosen target when the ability resolves.'>" +
						"<interleave>" +
							"<optional>" +
								"<element name='Origin' a:help='Whether the destruction should apply to the caster or the chosen target.'>" +
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
					"<element name='PetCommand' a:help='Optional command forwarded to the owner unit pet companion component.'>" +
						"<interleave>" +
							"<optional>" +
								"<element name='LoiterTime' a:help='How long, in milliseconds, the pet should stay near the commanded point before resuming its wander.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
						"</interleave>" +
					"</element>" +
				"</optional>" +
				"<optional>" +
					"<element name='WaypointRecord' a:help='Optional debug helper that records clicked waypoint offsets relative to the caster building.'>" +
						"<interleave>" +
							"<element name='Kind'>" +
								"<choice>" +
									"<value>entry</value>" +
									"<value>exit</value>" +
								"</choice>" +
							"</element>" +
							"<optional>" +
								"<element name='Clear'>" +
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
					"<element name='ScoutReveal' a:help='Optional directional fog reveal approximated by spawned vision revealers that persist until the caster moves.'>" +
						"<interleave>" +
							"<element name='Template' a:help='Vision revealer template spawned to build the cone.'>" +
								"<text/>" +
							"</element>" +
							"<element name='Reach' a:help='How far the reveal extends from the caster in meters.'>" +
								"<ref name='positiveDecimal'/>" +
							"</element>" +
							"<optional>" +
								"<element name='NearWidth' a:help='Approximate cone width near the caster in meters.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='FarWidth' a:help='Approximate cone width near the far end in meters.'>" +
									"<ref name='nonNegativeDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='SegmentSpacing' a:help='Forward spacing between revealer rows in meters.'>" +
									"<ref name='positiveDecimal'/>" +
								"</element>" +
							"</optional>" +
							"<optional>" +
								"<element name='MoveTolerance' a:help='How far the caster may drift before the reveal collapses, in meters.'>" +
									"<ref name='nonNegativeDecimal'/>" +
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
	this.activeScoutReveals = {};
	this.scoutRevealMonitorTimer = undefined;
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

Abilities.prototype.GetEffectDelay = function(ability)
{
	if (!ability)
		return 0;

	if (ability.EffectDelay !== undefined)
		return +ability.EffectDelay;

	return ability.Delay !== undefined ? +ability.Delay : 0;
};

Abilities.prototype.GetTargetRange = function(target)
{
	if (!target)
		return undefined;

	if (target.MaxRange !== undefined)
		return +target.MaxRange;

	return target.Range !== undefined ? +target.Range : undefined;
};

Abilities.prototype.GetPointResolveRange = function(target)
{
	if (!target)
		return 0;

	if (target.Range !== undefined)
		return +target.Range;

	return this.GetTargetRange(target) || 0;
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
			"range": this.GetTargetRange(target) || 0,
			"cursor": target.Cursor || "",
			"previewTemplate": target.PreviewTemplate || "",
			"previewAngleOffset": target.PreviewAngleOffset !== undefined ? +target.PreviewAngleOffset : 0,
			"players": this.GetTokenString(target.TargetPlayers),
			"classes": this.GetTokenString(target.Classes),
			"classesAny": this.GetTokenString(target.ClassesAny),
			"restrictedClasses": this.GetTokenString(target.RestrictedClasses),
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
			"delay": this.GetEffectDelay(ability),
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
	if (!ability)
		return false;

	if (!this.CanTriggerAbility(name))
	{
		this.WarnAbilityDebug(name, "blocked", "reason=cooldown-or-missing-state");
		return false;
	}

	if (data)
		this.CancelQueuedAbilityTimers();

	const targetContext = this.ResolveTargetContext(ability, data);
	if (!targetContext)
	{
		const queuedInRange = this.TryQueueAbilityInRange(name, ability, data);
		this.WarnTargetedAbilityFailure(name, ability, data, queuedInRange);
		return queuedInRange;
	}

	if (!this.CanSpawnEntity(ability))
	{
		this.WarnAbilityDebug(name, "blocked", "reason=spawn-limit");
		return false;
	}

	this.lastTriggered[name] = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();

	this.PrepareDelayedAbility(ability);
	if (this.ShouldFaceTowardsContext(ability))
		this.FaceTowardsContext(targetContext);
	this.TriggerAnimation(ability);
	this.ExecuteImmediateAbilityEffects(name, ability, targetContext);
	this.ScheduleAbilityExecution(name, ability, targetContext);

	return true;
};

Abilities.prototype.WarnAbilityDebug = function(name, stage, details)
{
	return;
};

Abilities.prototype.WarnTargetedAbilityFailure = function(name, ability, data, queuedInRange)
{
	if (!ability || !ability.Target)
		return;

	const targetType = this.GetNormalizedTargetType(ability.Target.Type);
	if (targetType == "entity")
	{
		const rawTarget = data && data.target;
		const target = this.GetEffectiveEntityTarget(rawTarget);
		const error = this.GetEntityTargetError(ability, target, false);
		this.WarnAbilityDebug(name, queuedInRange ? "target-queued" : "target-failed",
			"targetType=entity rawTarget=" + rawTarget + " target=" + target + " error=" + error +
			" queued=" + queuedInRange);
		return;
	}

	if (targetType == "point")
	{
		const position = data && data.position;
		this.WarnAbilityDebug(name, queuedInRange ? "target-queued" : "target-failed",
			"targetType=point hasPosition=" + !!position + " queued=" + queuedInRange);
	}
};

Abilities.prototype.TryQueueAbilityInRange = function(name, ability, data)
{
	if (ability.Target && ability.Target.AutoMove == "false")
		return false;

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI)
		return false;

	const targetType = this.GetNormalizedTargetType(ability.Target && ability.Target.Type);
	if (targetType == "entity" && data && data.target)
	{
		const rawTarget = data.target;
		const target = this.GetEffectiveEntityTarget(rawTarget);
		if (this.GetEntityTargetError(ability, target, false) != "range")
		{
			this.WarnAbilityDebug(name, "queue-rejected",
				"targetType=entity rawTarget=" + rawTarget + " target=" + target + " reason=not-range");
			return false;
		}

		if (ability.Infiltration)
		{
			const fallbackPosition3D = this.GetEntityPosition3D(rawTarget);
			const fallbackPosition2D = fallbackPosition3D ? new Vector2D(fallbackPosition3D.x, fallbackPosition3D.z) : undefined;
			const approachPoint = this.GetInfiltrationApproachPoint(target, fallbackPosition2D);
			if (!approachPoint ||
				!this.IssueMoveToPointRange(cmpUnitAI, approachPoint.x, approachPoint.y, 1))
			{
				this.WarnAbilityDebug(name, "queue-rejected",
					"targetType=entity rawTarget=" + rawTarget + " target=" + target + " reason=infiltration-entry-move-failed");
				return false;
			}

			this.WarnAbilityDebug(name, "queue-approach",
				"targetType=entity rawTarget=" + rawTarget + " target=" + target +
				" mode=infiltration-entry x=" + approachPoint.x.toFixed(2) + " z=" + approachPoint.y.toFixed(2));
		}
		else if (this.IsMirageEntity(rawTarget))
		{
			const targetPosition3D = this.GetEntityPosition3D(rawTarget);
			if (!targetPosition3D ||
				!this.IssueMoveToPointRange(cmpUnitAI, targetPosition3D.x, targetPosition3D.z, this.GetTargetRange(ability.Target)))
			{
				this.WarnAbilityDebug(name, "queue-rejected",
					"targetType=entity rawTarget=" + rawTarget + " target=" + target + " reason=mirage-move-failed");
				return false;
			}

			this.WarnAbilityDebug(name, "queue-approach",
				"targetType=entity rawTarget=" + rawTarget + " target=" + target +
				" mode=point x=" + targetPosition3D.x.toFixed(2) + " z=" + targetPosition3D.z.toFixed(2) +
				" range=" + this.GetTargetRange(ability.Target));
		}
		else if (!this.IssueMoveToEntityRange(cmpUnitAI, target, this.GetTargetRange(ability.Target)))
		{
			this.WarnAbilityDebug(name, "queue-rejected",
				"targetType=entity rawTarget=" + rawTarget + " target=" + target + " reason=entity-move-failed");
			return false;
		}
		else
			this.WarnAbilityDebug(name, "queue-approach",
				"targetType=entity rawTarget=" + rawTarget + " target=" + target +
				" mode=entity range=" + this.GetTargetRange(ability.Target));

		this.QueueAbilityRetry(name, {
			"target": rawTarget,
			"resolvedTarget": target,
			"noExpiry": !!ability.Infiltration
		});
		return true;
	}

	if (targetType == "point" && data && data.position)
	{
		if (ability.Infiltration)
		{
			const infiltrationTargetContext = this.GetInfiltrationPointTargetContext(ability, data.position, true);
			if (infiltrationTargetContext)
			{
				const approachPoint = this.GetInfiltrationApproachPoint(infiltrationTargetContext.entity, data.position);
				if (approachPoint &&
					this.IssueMoveToPointRange(
						cmpUnitAI,
						approachPoint.x,
						approachPoint.y,
						1))
				{
					this.WarnAbilityDebug(name, "queue-approach",
						"targetType=point mode=infiltration-entry target=" + infiltrationTargetContext.entity +
						" x=" + approachPoint.x.toFixed(2) + " z=" + approachPoint.y.toFixed(2));

					this.QueueAbilityRetry(name, {
						"position": {
							"x": data.position.x,
							"z": data.position.z
						},
						"noExpiry": true
					});
					return true;
				}
			}
		}

		if (this.CanResolvePointTarget(ability, data.position) ||
			!this.IssueMoveToPointRange(cmpUnitAI, data.position.x, data.position.z, this.GetPointResolveRange(ability.Target)))
		{
			this.WarnAbilityDebug(name, "queue-rejected",
				"targetType=point reason=" + (this.CanResolvePointTarget(ability, data.position) ? "already-in-range" : "point-move-failed"));
			return false;
		}

		this.WarnAbilityDebug(name, "queue-approach",
			"targetType=point x=" + data.position.x + " z=" + data.position.z +
			" range=" + this.GetPointResolveRange(ability.Target));

		this.QueueAbilityRetry(name, {
			"position": {
				"x": data.position.x,
				"z": data.position.z
			}
		});
		return true;
	}

	return false;
};

/**
 * Queue a normal walk order toward an entity target until the caster is in range.
 *
 * @param {UnitAI|null} cmpUnitAI
 * @param {number} target
 * @param {number|undefined} range
 * @returns {boolean}
 */
Abilities.prototype.IssueMoveToEntityRange = function(cmpUnitAI, target, range)
{
	if (!cmpUnitAI)
		return false;

	cmpUnitAI.AddOrder("WalkToTarget", {
		"target": target,
		"min": 0,
		"max": range,
		"force": true
	}, false, false);
	return true;
};

/**
 * Queue a normal walk order toward a point target until the caster is in range.
 *
 * @param {UnitAI|null} cmpUnitAI
 * @param {number} x
 * @param {number} z
 * @param {number|undefined} range
 * @returns {boolean}
 */
Abilities.prototype.IssueMoveToPointRange = function(cmpUnitAI, x, z, range)
{
	if (!cmpUnitAI)
		return false;

	cmpUnitAI.WalkToPointRange(x, z, 0, range, false, false);
	return true;
};
Abilities.prototype.QueueAbilityRetry = function(name, data)
{
	const token = String(this.nextQueuedAbilityToken++);
	this.WarnAbilityDebug(name, "queue-retry",
		"token=" + token +
		(data && data.target !== undefined ? " target=" + data.target : "") +
		(data && data.position ? " position=" + data.position.x + "," + data.position.z : ""));
	this.queuedAbilityTimers[token] = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetInterval(
		this.entity,
		IID_Abilities,
		"ProcessQueuedAbility",
		200,
		200,
		{
			"token": token,
			"name": name,
			"target": data && data.target,
			"resolvedTarget": data && data.resolvedTarget,
			"position": data && data.position,
			"expires": data && data.noExpiry ? undefined :
				Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() + 15000
		});
};

Abilities.prototype.ProcessQueuedAbility = function(data, lateness)
{
	if (!data || !data.token || !this.queuedAbilityTimers[data.token])
		return;

	const ability = this.GetAbilityTemplate(data.name);
	if (!ability)
	{
		this.WarnAbilityDebug(data.name, "queue-cancel", "token=" + data.token + " reason=missing-ability");
		this.CancelQueuedAbilityTimer(data.token);
		return;
	}

	const currentTime = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	if (data.expires !== undefined && currentTime >= data.expires)
	{
		this.WarnAbilityDebug(data.name, "queue-cancel", "token=" + data.token + " reason=expired");
		this.CancelQueuedAbilityTimer(data.token);
		return;
	}

	const targetType = this.GetNormalizedTargetType(ability.Target && ability.Target.Type);
	let targetContext = undefined;
	if (targetType == "entity")
	{
		const retryTarget = data.resolvedTarget || data.target;
		const targetError = this.GetEntityTargetError(ability, retryTarget, true);
		if (targetError != "none" && targetError != "range")
		{
			this.WarnAbilityDebug(data.name, "queue-cancel",
				"token=" + data.token + " reason=target-error error=" + targetError + " target=" + retryTarget);
			this.CancelQueuedAbilityTimer(data.token);
			return;
		}

		targetContext = this.ResolveTargetContext(ability, { "target": retryTarget });
	}
	else if (targetType == "point")
		targetContext = this.ResolveTargetContext(ability, { "position": data.position });

	if (!targetContext)
	{
		this.WarnAbilityDebug(data.name, "queue-wait",
			"token=" + data.token + " reason=still-out-of-range");
		return;
	}

	this.CancelQueuedAbilityTimer(data.token);
	this.WarnAbilityDebug(data.name, "queue-fire", "token=" + data.token);
	if (!this.CanTriggerAbility(data.name))
	{
		this.WarnAbilityDebug(data.name, "queue-cancel", "token=" + data.token + " reason=cooldown");
		return;
	}

	this.lastTriggered[data.name] = currentTime;
	this.PrepareDelayedAbility(ability);
	if (this.ShouldFaceTowardsContext(ability))
		this.FaceTowardsContext(targetContext);
	this.TriggerAnimation(ability);
	this.ExecuteImmediateAbilityEffects(data.name, ability, targetContext);
	this.ScheduleAbilityExecution(data.name, ability, targetContext);
};

Abilities.prototype.ShouldFaceTowardsContext = function(ability)
{
	return !ability || !ability.WaypointRecord;
};

Abilities.prototype.PrepareDelayedAbility = function(ability)
{
	if (!ability || ability.CancelOnOrderChange != "true" || !(this.GetEffectDelay(ability) > 0))
		return;

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI)
		cmpUnitAI.Stop(false);
};

Abilities.prototype.ExecuteImmediateAbilityEffects = function(name, ability, targetContext)
{
	if (this.IsImmediateSpawnEntity(ability))
		this.SpawnEntity(ability, targetContext);
};

Abilities.prototype.ScheduleAbilityExecution = function(name, ability, targetContext)
{
	const delay = this.GetEffectDelay(ability);
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
	if (!cmpUnitAI)
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
	this.ApplyDirectHeal(ability, targetContext);
	this.ApplyInfiltration(ability, targetContext);
	this.ApplyOwnershipChange(ability, targetContext);
	this.ApplyDestroyEntityEffect(ability, targetContext);
	this.ApplyPetCommand(ability, targetContext);
	this.ApplyWaypointRecord(ability, targetContext);
	this.ApplyScoutReveal(name, ability, targetContext);
	this.ApplyAreaHeal(ability, targetContext);
	this.ApplyAreaAttack(name, ability, targetContext);

	if (ability.Sound)
		PlaySound(ability.Sound, this.entity);
};

/**
 * Rotate the caster toward the current target context before resolving effects.
 *
 * This prefers UnitAI-facing helpers, then UnitMotion, and finally falls back to
 * turning the Position component directly when the entity is in the world.
 *
 * @param {Object|undefined} targetContext
 */
Abilities.prototype.FaceTowardsContext = function(targetContext)
{
	if (!targetContext || !targetContext.position)
		return;

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI && targetContext.entity !== undefined)
	{
		cmpUnitAI.FaceTowardsTarget(targetContext.entity);
		return;
	}

	const cmpUnitMotion = Engine.QueryInterface(this.entity, IID_UnitMotion);
	if (cmpUnitMotion)
	{
		cmpUnitMotion.FaceTowardsPoint(targetContext.position.x, targetContext.position.y !== undefined ? targetContext.position.y : targetContext.position.z);
		return;
	}

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return;

	cmpPosition.TurnTo(cmpPosition.GetPosition2D().angleTo(this.AsVector2D(targetContext.position)));
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

/**
 * Read the 2D world position for an in-world entity.
 *
 * @param {number} entity
 * @returns {Vector2D|undefined}
 */
Abilities.prototype.GetEntityPosition = function(entity)
{
	const cmpPosition = Engine.QueryInterface(entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return undefined;

	return cmpPosition.GetPosition2D();
};

/**
 * Read the 3D world position for an in-world entity.
 *
 * @param {number} entity
 * @returns {Vector3D|undefined}
 */
Abilities.prototype.GetEntityPosition3D = function(entity)
{
	const cmpPosition = Engine.QueryInterface(entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return undefined;

	const pos = cmpPosition.GetPosition();
	return new Vector3D(pos.x, pos.y, pos.z);
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
		const target = this.GetEffectiveEntityTarget(data && data.target);
		if (!this.CanTargetEntity(ability, target))
			return undefined;

		return this.GetContextForEntity(target);
	}

	const position = data && data.position;
	if (ability.Infiltration)
		return this.GetInfiltrationPointTargetContext(ability, position, false);

	if (!this.CanResolvePointTarget(ability, position))
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

Abilities.prototype.GetEffectiveEntityTarget = function(target)
{
	if (!target)
		return target;

	const cmpMirage = typeof IID_Mirage == "undefined" ? null : Engine.QueryInterface(target, IID_Mirage);
	if (!cmpMirage || typeof cmpMirage.GetParent != "function")
		return target;

	const parent = cmpMirage.GetParent();
	return parent === undefined || parent == INVALID_ENTITY ? target : parent;
};

Abilities.prototype.IsMirageEntity = function(target)
{
	return !!target &&
		typeof IID_Mirage != "undefined" &&
		!!Engine.QueryInterface(target, IID_Mirage);
};

/**
 * Return the full identity class list for a target, or an empty list when the
 * Identity component is missing.
 *
 * @param {Identity|null} cmpIdentity
 * @returns {string[]}
 */
Abilities.prototype.GetIdentityClasses = function(cmpIdentity)
{
	if (!cmpIdentity)
		return [];

	return cmpIdentity.GetClassesList();
};

/**
 * Check whether the target matches every required identity class.
 *
 * @param {Identity|null} cmpIdentity
 * @param {string[]} requiredClasses
 * @returns {boolean}
 */
Abilities.prototype.HasAllIdentityClasses = function(cmpIdentity, requiredClasses)
{
	if (!requiredClasses.length)
		return true;

	if (!cmpIdentity)
		return false;

	return requiredClasses.every(className => cmpIdentity.HasClass(className));
};

/**
 * Check whether the target matches any restricted identity class.
 *
 * @param {Identity|null} cmpIdentity
 * @param {string[]} restrictedClasses
 * @returns {boolean}
 */
Abilities.prototype.HasAnyIdentityClass = function(cmpIdentity, restrictedClasses)
{
	if (!restrictedClasses.length || !cmpIdentity)
		return false;

	return restrictedClasses.some(className => cmpIdentity.HasClass(className));
};

Abilities.prototype.GetEntityTargetError = function(ability, target, ignoreRange)
{
	target = this.GetEffectiveEntityTarget(target);

	if (!target)
		return "target";

	if (target == this.entity && (!ability.Target || ability.Target.AllowSelf == "false"))
		return "self";

	const targetPosition = this.GetEntityPosition(target);
	if (!targetPosition)
		return "position";

	if (!ignoreRange && !this.IsEntityInRange(target, this.GetTargetRange(ability.Target)))
		return "range";

	const targetPlayers = this.GetTargetPlayers(ability.Target && ability.Target.TargetPlayers, "Player Ally Enemy MutualAlly Neutral");
	if (targetPlayers.length)
	{
		const cmpOwnership = Engine.QueryInterface(target, IID_Ownership);
		if (!cmpOwnership || targetPlayers.indexOf(cmpOwnership.GetOwner()) == -1)
			return "players";
	}

	const requiredClasses = this.GetTokenString(ability.Target && ability.Target.Classes).split(/\s+/).filter(Boolean);
	const requiredAnyClasses = this.GetTokenString(ability.Target && ability.Target.ClassesAny).split(/\s+/).filter(Boolean);
	const restrictedClasses = this.GetTokenString(ability.Target && ability.Target.RestrictedClasses).split(/\s+/).filter(Boolean);
	if (!requiredClasses.length && !requiredAnyClasses.length && !restrictedClasses.length)
		return "none";

	const cmpIdentity = Engine.QueryInterface(target, IID_Identity);
	if (!cmpIdentity)
		return "identity";

	if (!this.HasAllIdentityClasses(cmpIdentity, requiredClasses))
		return "classes";

	if (requiredAnyClasses.length && !this.HasAnyIdentityClass(cmpIdentity, requiredAnyClasses))
		return "classes";

	return this.HasAnyIdentityClass(cmpIdentity, restrictedClasses) ? "restricted-classes" : "none";
};

Abilities.prototype.CanTargetPoint = function(ability, position)
{
	if (!position)
		return false;

	return this.IsTargetInRange(ability.Target, this.AsVector2D(position));
};

Abilities.prototype.CanResolvePointTarget = function(ability, position)
{
	if (!position)
		return false;

	return this.IsPointInRange(this.GetPointResolveRange(ability.Target), this.AsVector2D(position));
};

Abilities.prototype.GetInfiltrationSearchRadius = function(ability)
{
	return Math.max(16, this.GetTargetRange(ability.Target) || 0);
};

Abilities.prototype.GetInfiltrationPointTargetContext = function(ability, position, ignoreRange)
{
	if (!ability || !ability.Infiltration || !position)
		return undefined;

	const origin = this.AsVector2D(position);
	if (!origin)
		return undefined;

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager)
		return undefined;

	const players = this.GetTargetPlayers(
		ability.Target && ability.Target.TargetPlayers,
		"Player Ally Enemy MutualAlly Neutral");
	const candidates = cmpRangeManager.ExecuteQueryAroundPos(
		origin, 0, this.GetInfiltrationSearchRadius(ability), players, IID_Identity, true);
	if (!candidates || !candidates.length)
		return undefined;

	let best = INVALID_ENTITY;
	let bestDistance = Infinity;
	for (const candidate of candidates)
	{
		if (this.GetEntityTargetError(ability, candidate, ignoreRange) != "none")
			continue;

		const candidatePosition = this.GetEntityPosition(candidate);
		if (!candidatePosition)
			continue;

		const distance = candidatePosition.distanceTo(origin);
		if (distance >= bestDistance)
			continue;

		best = candidate;
		bestDistance = distance;
	}

	return best == INVALID_ENTITY ? undefined : this.GetContextForEntity(best);
};

Abilities.prototype.GetInfiltrationApproachPoint = function(target, fallbackPosition)
{
	let referencePoint = fallbackPosition ? this.AsVector2D(fallbackPosition) : this.GetEntityPosition(this.entity);

	if (typeof IID_InfiltrationEntrance != "undefined")
	{
		const cmpInfiltrationEntrance = Engine.QueryInterface(target, IID_InfiltrationEntrance);
		if (cmpInfiltrationEntrance)
		{
			const entryPath = cmpInfiltrationEntrance.GetEntryPath();
			if (entryPath && entryPath.length)
				referencePoint = entryPath[0];
		}
	}

	return this.GetClosestFootprintEdgePoint(target, referencePoint) || referencePoint;
};

Abilities.prototype.GetClosestFootprintEdgePoint = function(target, referencePoint)
{
	if (typeof IID_Footprint == "undefined" || !referencePoint)
		return undefined;

	const cmpFootprint = Engine.QueryInterface(target, IID_Footprint);
	if (!cmpFootprint || typeof cmpFootprint.GetShape != "function")
		return undefined;

	const shape = cmpFootprint.GetShape();
	const center = this.GetEntityPosition(target);
	if (!shape || !center)
		return undefined;

	const cmpPosition = Engine.QueryInterface(target, IID_Position);
	const rotation = cmpPosition && typeof cmpPosition.GetRotation == "function" ? cmpPosition.GetRotation().y : 0;
	const localReference = Vector2D.sub(this.AsVector2D(referencePoint), center).rotate(-rotation);

	let localEdge = undefined;
	if (shape.type == "circle" && shape.radius > 0)
	{
		const direction = localReference.length() > 0.001 ? localReference.normalize() : new Vector2D(0, 1);
		localEdge = direction.mult(+shape.radius);
	}
	else if (shape.type == "square" && shape.width > 0 && shape.depth > 0)
		localEdge = this.GetClosestSquareEdgePoint(localReference, +shape.width / 2, +shape.depth / 2);

	if (!localEdge)
		return undefined;

	return Vector2D.add(center, new Vector2D(localEdge.x, localEdge.y).rotate(rotation));
};

Abilities.prototype.GetClosestSquareEdgePoint = function(point, halfWidth, halfDepth)
{
	if (!(halfWidth > 0) || !(halfDepth > 0))
		return undefined;

	const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
	const clamped = new Vector2D(
		clamp(point.x, -halfWidth, halfWidth),
		clamp(point.y, -halfDepth, halfDepth)
	);
	const inside = Math.abs(point.x) < halfWidth && Math.abs(point.y) < halfDepth;
	if (!inside)
		return clamped;

	const dx = halfWidth - Math.abs(point.x);
	const dy = halfDepth - Math.abs(point.y);
	if (dx <= dy)
		clamped.x = (Math.sign(point.x) || 1) * halfWidth;
	else
		clamped.y = (Math.sign(point.y) || 1) * halfDepth;

	return clamped;
};

Abilities.prototype.IsTargetInRange = function(target, position)
{
	return this.IsPointInRange(this.GetTargetRange(target), position);
};

Abilities.prototype.IsEntityInRange = function(target, range)
{
	if (range === undefined)
		return true;

	const cmpObstructionManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ObstructionManager);
	if (cmpObstructionManager)
		return cmpObstructionManager.IsInTargetRange(this.entity, target, 0, range, false);

	return this.IsPointInRange(range, this.GetEntityPosition(target));
};

Abilities.prototype.IsPointInRange = function(range, position)
{
	if (range === undefined)
		return true;

	const sourcePosition = this.GetEntityPosition(this.entity);
	if (!sourcePosition || !position)
		return false;

	return sourcePosition.distanceTo(this.AsVector2D(position)) <= range;
};

Abilities.prototype.GetEffectOriginContext = function(effect, targetContext)
{
	if (effect && effect.Origin == "target" && targetContext && targetContext.position)
		return targetContext;

	return this.GetContextForEntity(this.entity);
};

/**
 * Infer whether the caster should be treated as already fighting.
 *
 * The ability system uses both the current UnitAI state and the active order so
 * passive triggers can behave consistently during approach and attack phases.
 *
 * @returns {boolean}
 */
Abilities.prototype.IsInBattle = function()
{
	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI)
		return false;

	const state = cmpUnitAI.GetCurrentState();
	if (state && state.indexOf("COMBAT") != -1)
		return true;

	const orders = cmpUnitAI.GetOrders();
	if (!orders || !orders.length)
		return false;

	const activeOrder = orders[0];
	if (!activeOrder || !activeOrder.type)
		return false;

	return activeOrder.type == "Attack" ||
		activeOrder.type == "WalkAndFight" ||
		activeOrder.type == "Patrol";
};

/**
 * Check whether an auto-trigger is allowed to fire in the caster's current state.
 *
 * @param {Object|undefined} autoTrigger
 * @returns {boolean}
 */
Abilities.prototype.MatchesAutoTriggerState = function(autoTrigger)
{
	if (!autoTrigger || !autoTrigger.State)
		return this.IsInBattle();

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (!cmpUnitAI)
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
		cmpOwnership.SetOwner(this.GetSpawnEntityOwner(ability.SpawnEntity));
	}

	const cmpSpawnedEntity = Engine.QueryInterface(entity, IID_SpawnedEntity);
	if (cmpSpawnedEntity)
		cmpSpawnedEntity.SetSpawner(this.entity);

	if (!ability.SpawnEntity.Duration)
		return;

	Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetTimeout(
		this.entity,
		IID_Abilities,
		"DestroyEntity",
		+ability.SpawnEntity.Duration,
		entity);
};

Abilities.prototype.CanSpawnEntity = function(ability)
{
	if (!ability || !ability.SpawnEntity || !(+ability.SpawnEntity.ActiveLimit > 0))
		return true;

	return this.CountActiveSpawnedEntities(ability.SpawnEntity) < +ability.SpawnEntity.ActiveLimit;
};

Abilities.prototype.GetSpawnEntityOwner = function(spawnTemplate)
{
	if (!spawnTemplate || spawnTemplate.Owner == "gaia")
		return 0;

	const cmpCasterOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	return cmpCasterOwnership ? cmpCasterOwnership.GetOwner() : 0;
};

Abilities.prototype.CountActiveSpawnedEntities = function(spawnTemplate)
{
	if (!spawnTemplate || !spawnTemplate.Template)
		return 0;

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager || !cmpRangeManager.GetEntitiesByPlayer)
		return 0;

	const owner = this.GetSpawnEntityOwner(spawnTemplate);
	if (owner === undefined || owner == INVALID_PLAYER)
		return 0;

	return cmpRangeManager.GetEntitiesByPlayer(owner)
		.filter(entity => entity != INVALID_ENTITY && entity != this.entity &&
			this.EntityMatchesTemplate(entity, spawnTemplate.Template) &&
			this.EntityWasSpawnedBy(entity, this.entity))
		.length;
};

Abilities.prototype.EntityMatchesTemplate = function(entity, templateName)
{
	if (entity === undefined || !templateName)
		return false;

	return this.GetEntityTemplateName(entity) == templateName;
};

Abilities.prototype.GetEntityTemplateName = function(entity)
{
	if (typeof IID_TemplateManager != "undefined")
	{
		const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
		if (cmpTemplateManager && cmpTemplateManager.GetCurrentTemplateName)
		{
			const templateName = cmpTemplateManager.GetCurrentTemplateName(entity);
			if (templateName)
				return templateName;
		}
	}

	const cmpIdentity = Engine.QueryInterface(entity, IID_Identity);
	if (cmpIdentity && cmpIdentity.GetSelectionGroupName)
		return cmpIdentity.GetSelectionGroupName();

	return undefined;
};

Abilities.prototype.EntityWasSpawnedBy = function(entity, spawner)
{
	const cmpSpawnedEntity = Engine.QueryInterface(entity, IID_SpawnedEntity);
	return !!cmpSpawnedEntity && cmpSpawnedEntity.GetSpawner && cmpSpawnedEntity.GetSpawner() == spawner;
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
	if (!this.HasAttackEffects(ability.AreaAttack))
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
	const attackData = this.GetAttackEffectsData(name, "AreaAttack", ability.AreaAttack);

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
	if (!this.HasAttackEffects(ability.DirectDamage))
		return;

	const origin = this.GetEffectOriginContext(ability.DirectDamage, targetContext);
	if (!origin || origin.entity === undefined)
		return;

	const cmpHealth = Engine.QueryInterface(origin.entity, IID_Health);
	if (!cmpHealth)
		return;

	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const owner = cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;
	const attackData = this.GetAttackEffectsData(name, "DirectDamage", ability.DirectDamage);

	if (ability.Projectile && this.ApplyProjectileDirectDamage(name, ability, origin.entity, attackData, owner))
		return;

	AttackHelper.HandleAttackEffects(origin.entity, {
		"type": name + ".DirectDamage",
		"attackData": attackData,
		"attacker": this.entity,
		"attackerOwner": owner
	});
};

Abilities.prototype.ApplyDirectHeal = function(ability, targetContext)
{
	if (!ability.DirectHeal)
		return;

	const origin = this.GetEffectOriginContext(ability.DirectHeal, targetContext);
	if (!origin || origin.entity === undefined)
		return;

	this.HealEntity(origin.entity, +ability.DirectHeal.Amount);
};

Abilities.prototype.ApplyAreaHeal = function(ability, targetContext)
{
	if (!ability.AreaHeal)
		return;

	const players = this.GetTargetPlayers(ability.AreaHeal.TargetPlayers, "Player");
	if (!players.length)
		return;

	const origin = this.GetEffectOriginContext(ability.AreaHeal, targetContext);
	const targets = this.GetTargetsAroundContext(origin, +ability.AreaHeal.Range, players, IID_Health);
	if (!targets || !targets.length)
		return;

	for (const target of targets)
	{
		if (target == this.entity && ability.AreaHeal.IncludeSelf == "false")
			continue;

		this.HealEntity(target, +ability.AreaHeal.Amount);
	}
};

Abilities.prototype.HealEntity = function(target, amount)
{
	if (!(amount > 0))
		return false;

	const cmpHealth = Engine.QueryInterface(target, IID_Health);
	if (!cmpHealth || typeof cmpHealth.Increase != "function")
		return false;

	if (typeof cmpHealth.IsUnhealable == "function" && cmpHealth.IsUnhealable())
		return false;

	cmpHealth.Increase(amount);
	return true;
};

Abilities.prototype.ApplyInfiltration = function(ability, targetContext)
{
	if (!ability.Infiltration || !targetContext || targetContext.entity === undefined)
		return;

	const cmpInfiltrator = Engine.QueryInterface(this.entity, IID_Infiltrator);
	if (!cmpInfiltrator || typeof cmpInfiltrator.StartInfiltration != "function")
		return;

	cmpInfiltrator.StartInfiltration(targetContext.entity, {
		"duration": +ability.Infiltration.Duration,
		"resourceType": ability.Infiltration.ResourceType,
		"amount": +ability.Infiltration.Amount,
		"escapeDistance": +ability.Infiltration.EscapeDistance || 8
	});
};

Abilities.prototype.ApplyProjectileDirectDamage = function(name, ability, target, attackData, owner)
{
	const selfPosition = this.GetEntityPosition3D(this.entity);
	const targetPosition = this.GetEntityPosition3D(target);
	if (!selfPosition || !targetPosition)
		return false;

	const cmpProjectileManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ProjectileManager);
	const cmpDelayedDamage = Engine.QueryInterface(SYSTEM_ENTITY, IID_DelayedDamage);
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpProjectileManager || !cmpDelayedDamage || !cmpTimer)
		return false;

	const projectile = ability.Projectile;
	const horizSpeed = +projectile.Speed;
	if (!(horizSpeed > 0))
		return false;

	let actorName = projectile.ActorName || "";
	const impactActorName = projectile.ImpactActorName || "";
	const impactAnimationLifetime = +projectile.ImpactAnimationLifetime || 0;
	let launchPoint = selfPosition;

	const cmpVisual = Engine.QueryInterface(this.entity, IID_Visual);
	if (cmpVisual)
	{
		if (!actorName && typeof cmpVisual.GetProjectileActor == "function")
			actorName = cmpVisual.GetProjectileActor();

		if (typeof cmpVisual.GetProjectileLaunchPoint == "function")
		{
			const visualActorLaunchPoint = cmpVisual.GetProjectileLaunchPoint();
			if (visualActorLaunchPoint && typeof visualActorLaunchPoint.length == "function" && visualActorLaunchPoint.length() > 0)
				launchPoint = visualActorLaunchPoint;
		}
	}

	if (launchPoint == selfPosition && projectile.LaunchPoint)
		launchPoint = Vector3D.add(selfPosition, new Vector3D(0, +projectile.LaunchPoint["@y"], 0));

	const realHorizDistance = targetPosition.horizDistanceTo(selfPosition);
	const delay = realHorizDistance / horizSpeed * 1000;
	const projectileId = cmpProjectileManager.LaunchProjectileAtPoint(
		launchPoint,
		targetPosition,
		horizSpeed,
		+projectile.Gravity,
		actorName,
		impactActorName,
		impactAnimationLifetime);

	let attackImpactSound = "";
	const cmpSound = Engine.QueryInterface(this.entity, IID_Sound);
	if (cmpSound && typeof cmpSound.GetSoundGroup == "function")
		attackImpactSound = cmpSound.GetSoundGroup("attack_impact_ranged") || "";

	const directionDistance = realHorizDistance || 1;
	cmpTimer.SetTimeout(SYSTEM_ENTITY, IID_DelayedDamage, "Hit", delay, {
		"type": name + ".DirectDamage",
		"attackData": attackData,
		"attacker": this.entity,
		"attackerOwner": owner,
		"target": target,
		"position": targetPosition,
		"projectileId": projectileId,
		"direction": Vector3D.sub(targetPosition, selfPosition).div(directionDistance),
		"attackImpactSound": attackImpactSound,
		"friendlyFire": false
	});

	return true;
};

Abilities.prototype.HasAttackEffects = function(template)
{
	return !!(template && (template.Damage || template.Capture !== undefined || template.ApplyStatus || template.Bonuses));
};

Abilities.prototype.GetAttackEffectsData = function(name, effectType, template)
{
	return AttackHelper.GetAttackEffectsData("Abilities/" + name + "/" + effectType, template, this.entity);
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

Abilities.prototype.ApplyDestroyEntityEffect = function(ability, targetContext)
{
	if (!ability.DestroyEntity)
		return;

	const origin = this.GetEffectOriginContext(ability.DestroyEntity, targetContext);
	if (!origin || origin.entity === undefined)
		return;

	this.DestroyEntity(origin.entity);
};

Abilities.prototype.DestroyLocalEntity = function(entity)
{
	Engine.DestroyEntity(entity);
};

Abilities.prototype.DestroyEntity = function(entity)
{
	Engine.DestroyEntity(entity);
};

Abilities.prototype.ApplyPetCommand = function(ability, targetContext)
{
	if (!ability.PetCommand || !targetContext || !targetContext.position)
		return;

	const cmpPetCompanion = Engine.QueryInterface(this.entity, IID_PetCompanion);
	if (!cmpPetCompanion || !cmpPetCompanion.CommandPetToPoint)
		return;

	cmpPetCompanion.CommandPetToPoint(this.AsVector2D(targetContext.position), ability.PetCommand);
};

Abilities.prototype.ApplyWaypointRecord = function(ability, targetContext)
{
	if (!ability.WaypointRecord)
		return;

	const cmpWaypointRecorder = typeof IID_WaypointRecorder == "undefined" ? null :
		Engine.QueryInterface(this.entity, IID_WaypointRecorder);
	if (!cmpWaypointRecorder)
		return;

	const kind = ability.WaypointRecord.Kind || "entry";
	if (ability.WaypointRecord.Clear == "true")
	{
		cmpWaypointRecorder.ClearWaypoints(kind);
		return;
	}

	if (!targetContext || !targetContext.position)
		return;

	cmpWaypointRecorder.RecordWaypoint(kind, this.AsVector2D(targetContext.position));
};

Abilities.prototype.GetScoutRevealTemplate = function(ability)
{
	return ability && ability.ScoutReveal ? ability.ScoutReveal.Template : undefined;
};

Abilities.prototype.GetScoutRevealMoveTolerance = function(scoutReveal)
{
	if (!scoutReveal)
		return 0;

	return scoutReveal.MoveTolerance !== undefined ? +scoutReveal.MoveTolerance : 0.5;
};

Abilities.prototype.GetScoutRevealForward = function(sourcePosition, targetPosition)
{
	if (sourcePosition && targetPosition)
	{
		const dx = targetPosition.x - sourcePosition.x;
		const dz = (targetPosition.z !== undefined ? targetPosition.z : targetPosition.y) -
			(sourcePosition.z !== undefined ? sourcePosition.z : sourcePosition.y);
		const length = Math.sqrt(dx * dx + dz * dz);
		if (length > 0.001)
			return {
				"x": dx / length,
				"z": dz / length
			};
	}

	const angle = this.GetCasterRotation();
	return {
		"x": Math.sin(angle),
		"z": Math.cos(angle)
	};
};

Abilities.prototype.GetScoutRevealPattern = function(scoutReveal, sourcePosition, targetPosition)
{
	if (!scoutReveal || !sourcePosition)
		return [];

	const reach = +scoutReveal.Reach;
	if (!(reach > 0))
		return [];

	const forward = this.GetScoutRevealForward(sourcePosition, targetPosition);
	const right = {
		"x": forward.z,
		"z": -forward.x
	};
	const nearWidth = scoutReveal.NearWidth !== undefined ? +scoutReveal.NearWidth : 0;
	const farWidth = scoutReveal.FarWidth !== undefined ? +scoutReveal.FarWidth : 16;
	const segmentSpacing = scoutReveal.SegmentSpacing !== undefined ? +scoutReveal.SegmentSpacing : 6;
	const positions = [];
	const sourceZ = sourcePosition.z !== undefined ? sourcePosition.z : sourcePosition.y;

	for (let distance = Math.min(segmentSpacing, reach); distance <= reach; distance += segmentSpacing)
	{
		const t = Math.min(1, distance / reach);
		const width = nearWidth + (farWidth - nearWidth) * t;
		const halfAngle = Math.atan2(width / 2, Math.max(distance, 0.001));
		const arcCount = Math.max(1, Math.round(width / 5));
		const ringCount = Math.max(1, arcCount | 1);
		for (let index = 0; index < ringCount; ++index)
		{
			const angleOffset = ringCount == 1 ? 0 : -halfAngle + (2 * halfAngle) * index / (ringCount - 1);
			const dirX = forward.x * Math.cos(angleOffset) + right.x * Math.sin(angleOffset);
			const dirZ = forward.z * Math.cos(angleOffset) + right.z * Math.sin(angleOffset);
			positions.push({
				"x": sourcePosition.x + dirX * distance,
				"z": sourceZ + dirZ * distance
			});
		}
	}

	positions.push({
		"x": sourcePosition.x + forward.x * reach,
		"z": sourceZ + forward.z * reach
	});

	return positions;
};

Abilities.prototype.SpawnScoutRevealers = function(templateName, positions, owner)
{
	const entities = [];
	for (const position of positions)
	{
		const entity = Engine.AddEntity(templateName);
		if (!entity || entity == INVALID_ENTITY)
			continue;

		const cmpPosition = Engine.QueryInterface(entity, IID_Position);
		if (cmpPosition)
			cmpPosition.JumpTo(position.x, position.z);

		const cmpOwnership = Engine.QueryInterface(entity, IID_Ownership);
		if (cmpOwnership)
			cmpOwnership.SetOwner(owner);

		entities.push(entity);
	}
	return entities;
};

Abilities.prototype.ApplyScoutReveal = function(name, ability, targetContext)
{
	if (!ability.ScoutReveal || !targetContext || !targetContext.position)
		return;

	const templateName = this.GetScoutRevealTemplate(ability);
	if (!templateName)
		return;

	const sourcePosition = this.GetEntityPosition(this.entity);
	if (!sourcePosition)
		return;

	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const owner = cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;
	if (owner == INVALID_PLAYER)
		return;

	const positions = this.GetScoutRevealPattern(ability.ScoutReveal, sourcePosition, targetContext.position);
	if (!positions.length)
		return;

	this.DestroyAllScoutReveals();

	const entities = this.SpawnScoutRevealers(templateName, positions, owner);
	if (!entities.length)
		return;

	this.activeScoutReveals[name] = {
		"anchor": {
			"x": sourcePosition.x,
			"z": sourcePosition.y !== undefined ? sourcePosition.y : sourcePosition.z
		},
		"moveTolerance": this.GetScoutRevealMoveTolerance(ability.ScoutReveal),
		"entities": entities
	};

	this.EnsureScoutRevealMonitor();
};

Abilities.prototype.DestroyScoutReveal = function(name)
{
	const reveal = this.activeScoutReveals[name];
	if (!reveal)
		return;

	for (const entity of reveal.entities)
		Engine.DestroyEntity(entity);

	delete this.activeScoutReveals[name];
	this.CancelScoutRevealMonitorIfIdle();
};

Abilities.prototype.DestroyAllScoutReveals = function()
{
	for (const name in this.activeScoutReveals)
		this.DestroyScoutReveal(name);
};

Abilities.prototype.ShouldDestroyScoutReveal = function(reveal, currentPosition)
{
	if (!reveal || !currentPosition)
		return true;

	const anchor = this.AsVector2D(reveal.anchor);
	return !!anchor && currentPosition.distanceTo(anchor) > reveal.moveTolerance;
};

Abilities.prototype.CheckScoutRevealMovement = function()
{
	const currentPosition = this.GetEntityPosition(this.entity);
	for (const name in this.activeScoutReveals)
		if (this.ShouldDestroyScoutReveal(this.activeScoutReveals[name], currentPosition))
			this.DestroyScoutReveal(name);
};

Abilities.prototype.EnsureScoutRevealMonitor = function()
{
	if (this.scoutRevealMonitorTimer || !Object.keys(this.activeScoutReveals).length)
		return;

	this.scoutRevealMonitorTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetInterval(
		this.entity,
		IID_Abilities,
		"MonitorScoutRevealMovement",
		200,
		200,
		null);
};

Abilities.prototype.CancelScoutRevealMonitorIfIdle = function()
{
	if (this.scoutRevealMonitorTimer && !Object.keys(this.activeScoutReveals).length)
	{
		Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).CancelTimer(this.scoutRevealMonitorTimer);
		this.scoutRevealMonitorTimer = undefined;
	}
};

Abilities.prototype.MonitorScoutRevealMovement = function(data, lateness)
{
	this.CheckScoutRevealMovement();
};

Abilities.prototype.OnPositionChanged = function(msg)
{
	this.CheckScoutRevealMovement();
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
	if (cmpPosition && !cmpPosition.IsInWorld())
		return;

	const targetData = this.GetAutoTriggerData(ability);
	if (ability.Target && !targetData)
		return;

	this.TriggerAbility(name, targetData);
};

Abilities.prototype.GetAutoTriggerData = function(ability)
{
	const targetType = this.GetNormalizedTargetType(ability.Target && ability.Target.Type);
	if (targetType == "none")
		return undefined;

	if (targetType != "entity")
		return undefined;

	const target = this.GetFirstAutoTriggerTarget(ability);
	if (target === undefined)
		return undefined;

	return { "target": target };
};

Abilities.prototype.GetFirstAutoTriggerTarget = function(ability)
{
	const players = this.GetTargetPlayers(this.GetTokenString(ability.Target && ability.Target.TargetPlayers), "Enemy");
	if (!players.length)
		return undefined;

	const range = this.GetTargetRange(ability.Target);
	if (range === undefined)
		return undefined;

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager)
		return undefined;

	const candidates = cmpRangeManager.ExecuteQuery(this.entity, 0, range, players, IID_Identity, true);
	for (const candidate of candidates)
		if (this.GetEntityTargetError(ability, candidate, true) == "none")
			return candidate;

	return undefined;
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
	this.DestroyAllScoutReveals();
	this.CancelScoutRevealMonitorIfIdle();
};

Engine.RegisterComponentType(IID_Abilities, "Abilities", Abilities);
