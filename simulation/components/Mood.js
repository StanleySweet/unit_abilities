function Mood() {}

Mood.prototype.Schema = "<empty/>";

// Timer period and thresholds, in ticks of one timer period.
const MOOD_TICK = 1000;
const MOOD_EXPIRY_TICKS = 60;
const MOOD_BORED_TICKS = 30;
const MOOD_FIGHT_RANGE = 60;
const MOOD_SAD_REVIVES = 5;
const MOOD_SAD_MAX_LEVEL = 3;

/**
 * Settlers 5 style feelings. Purely cosmetic: the last added mood is the current one.
 */
Mood.prototype.Init = function()
{
	this.moods = [];
	this.level = 0;
	this.idleTicks = 0;
	this.timer = undefined;
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (cmpTimer)
		this.timer = cmpTimer.SetInterval(this.entity, IID_Mood, "Tick", MOOD_TICK, MOOD_TICK, null);
};

Mood.prototype.OnDestroy = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (cmpTimer && this.timer !== undefined)
		cmpTimer.CancelTimer(this.timer);
	this.timer = undefined;
};

/**
 * @return {string[]} Moods in the order added, the last one is the current one.
 */
Mood.prototype.GetMoods = function()
{
	return this.moods.map(mood => mood.name);
};

Mood.prototype.Add = function(name)
{
	this.Remove(name);
	this.moods.push({ "name": name, "ticks": 0 });
};

Mood.prototype.Remove = function(name)
{
	this.moods = this.moods.filter(mood => mood.name != name);
};

/**
 * Carry the state over to a revived fighter without triggering a promotion mood.
 */
Mood.prototype.Restore = function(data)
{
	this.level = data.level;
	this.moods = [];
	for (const name of data.moods || [])
		this.Add(name);
	if (data.level < data.oldLevel)
		this.Add("angry");
	if (data.deaths > 0 && data.deaths % MOOD_SAD_REVIVES == 0 && data.oldLevel < MOOD_SAD_MAX_LEVEL)
		this.Add("sad");
};

Mood.prototype.OnExperienceChanged = function()
{
	const cmpPromotion = Engine.QueryInterface(this.entity, IID_Promotion);
	if (!cmpPromotion || !cmpPromotion.GetLevel)
		return;

	const level = cmpPromotion.GetLevel();
	if (level > this.level)
	{
		this.Remove("sad");
		this.Add("happy");
	}
	else if (level < this.level)
		this.Add("angry");
	this.level = level;
};

Mood.prototype.IsInCombat = function(ent)
{
	const cmpUnitAI = Engine.QueryInterface(ent, IID_UnitAI);
	const state = cmpUnitAI && cmpUnitAI.GetCurrentState();
	return !!state && state.indexOf("COMBAT") != -1;
};

Mood.prototype.IsFriendFighting = function()
{
	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpOwnership || !cmpPosition || !cmpPosition.IsInWorld() || !cmpRangeManager)
		return false;

	return cmpRangeManager.ExecuteQueryAroundPos(cmpPosition.GetPosition2D(), 0, MOOD_FIGHT_RANGE,
		[cmpOwnership.GetOwner()], IID_UnitAI, true).some(ent => this.IsInCombat(ent));
};

Mood.prototype.Tick = function()
{
	for (const mood of this.moods)
		++mood.ticks;
	this.moods = this.moods.filter(mood =>
		(mood.name != "happy" && mood.name != "angry") || mood.ticks < MOOD_EXPIRY_TICKS);

	if (this.IsInCombat(this.entity))
	{
		this.idleTicks = 0;
		this.Remove("bored");
	}
	else if (++this.idleTicks >= MOOD_BORED_TICKS && this.IsFriendFighting())
		this.Add("bored");
};

Engine.RegisterComponentType(IID_Mood, "Mood", Mood);
