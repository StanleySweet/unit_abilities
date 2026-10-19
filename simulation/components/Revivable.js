function Revivable() {}

Revivable.prototype.Schema = "<empty/>";

// Settlers 5: safe for 11 one-second checks, within 1000 units (10 m) there; 0 A.D. scale is larger.
const REVIVE_SECONDS = 11;
const REVIVE_RADIUS = 30;
const REVIVE_HEALTH_FRACTION = 0.5;
const REVIVE_MARKER_TEMPLATE = "special/unit_abilities/revive_marker";

Revivable.prototype.Init = function()
{
	this.deaths = 0;
	this.data = undefined;
	this.progress = 0;
	this.timer = undefined;
};

Revivable.prototype.SetDeaths = function(deaths)
{
	this.deaths = deaths;
};

Revivable.prototype.GetDeaths = function()
{
	return this.deaths;
};

/**
 * Settlers 5 rank loss: General -> Major, Colonel -> Lieutenant, Major -> Corporal,
 * Lieutenant -> Corporal, Corporal stays. The 0 A.D. base rank (Leader, 0) stays 0.
 */
Revivable.prototype.GetRevivedLevel = function(level)
{
	return level == 0 ? 0 : Math.max(1, level - 2);
};

/**
 * Fighter side: leave a marker when dying.
 */
Revivable.prototype.OnHealthChanged = function(msg)
{
	if (this.data || msg.to != 0)
		return;

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const cmpPromotion = Engine.QueryInterface(this.entity, IID_Promotion);
	const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
	if (!cmpPosition || !cmpPosition.IsInWorld() || !cmpOwnership || !cmpTemplateManager)
		return;

	const marker = Engine.AddEntity(REVIVE_MARKER_TEMPLATE);
	const cmpMarkerRevivable = Engine.QueryInterface(marker, IID_Revivable);
	const cmpMarkerPosition = Engine.QueryInterface(marker, IID_Position);
	const cmpMarkerOwnership = Engine.QueryInterface(marker, IID_Ownership);
	if (!cmpMarkerRevivable || !cmpMarkerPosition || !cmpMarkerOwnership)
	{
		Engine.DestroyEntity(marker);
		return;
	}

	const position = cmpPosition.GetPosition2D();
	cmpMarkerPosition.JumpTo(position.x, position.y);
	cmpMarkerPosition.SetYRotation(cmpPosition.GetRotation().y);
	cmpMarkerOwnership.SetOwner(cmpOwnership.GetOwner());
	cmpMarkerRevivable.Arm({
		"template": cmpTemplateManager.GetCurrentTemplateName(this.entity),
		"owner": cmpOwnership.GetOwner(),
		"level": cmpPromotion && cmpPromotion.GetLevel ? cmpPromotion.GetLevel() : 0,
		"deaths": this.deaths + 1,
		"rotation": cmpPosition.GetRotation().y
	});
};

/**
 * Marker side: start the revive countdown.
 */
Revivable.prototype.Arm = function(data)
{
	this.data = data;
	this.progress = 0;
	this.timer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).SetInterval(
		this.entity, IID_Revivable, "Tick", 1000, 1000, null);
};

Revivable.prototype.GetProgress = function()
{
	return this.progress;
};

Revivable.prototype.HasUnitsNear = function(players)
{
	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	return players.length > 0 &&
		cmpRangeManager.ExecuteQuery(this.entity, 0, REVIVE_RADIUS, players, IID_UnitAI).length > 0;
};

Revivable.prototype.Tick = function()
{
	const cmpPlayer = QueryPlayerIDInterface(this.data.owner);
	if (!cmpPlayer || cmpPlayer.GetState() != "active")
	{
		Engine.DestroyEntity(this.entity);
		return;
	}

	if (!this.HasUnitsNear(cmpPlayer.GetEnemies()) && this.HasUnitsNear(cmpPlayer.GetMutualAllies()))
		++this.progress;
	else
		this.progress = Math.max(0, this.progress - 1);

	if (this.progress >= REVIVE_SECONDS)
		this.Revive();
};

Revivable.prototype.Revive = function()
{
	const data = this.data;
	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	const position = cmpPosition.GetPosition2D();

	const fighter = Engine.AddEntity(data.template);
	const cmpFighterPosition = Engine.QueryInterface(fighter, IID_Position);
	cmpFighterPosition.JumpTo(position.x, position.y);
	cmpFighterPosition.SetYRotation(data.rotation);
	Engine.QueryInterface(fighter, IID_Ownership).SetOwner(data.owner);

	const cmpFighterRevivable = Engine.QueryInterface(fighter, IID_Revivable);
	if (cmpFighterRevivable)
		cmpFighterRevivable.SetDeaths(data.deaths);

	const cmpPromotion = Engine.QueryInterface(fighter, IID_Promotion);
	if (cmpPromotion && cmpPromotion.SetLevel)
		cmpPromotion.SetLevel(this.GetRevivedLevel(data.level));

	const cmpHealth = Engine.QueryInterface(fighter, IID_Health);
	if (cmpHealth)
		cmpHealth.SetHitpoints(cmpHealth.GetMaxHitpoints() * REVIVE_HEALTH_FRACTION);

	Engine.DestroyEntity(this.entity);
};

Revivable.prototype.OnDestroy = function()
{
	if (this.timer !== undefined)
		Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).CancelTimer(this.timer);
	this.timer = undefined;
};

Engine.RegisterComponentType(IID_Revivable, "Revivable", Revivable);
