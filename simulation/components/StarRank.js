function StarRank() {}

const STAR_RANK_LEVEL_NAMES = ["Leader", "Corporal", "Lieutenant", "Major", "Colonel", "General"];

// Cumulative bonuses over the template, used when <Levels> is omitted.
const STAR_RANK_DEFAULT_LEVELS = [
	{ "RequiredXp": 100, "Health": 0, "Regen": 0, "Armor": 1, "Damage": 1 },
	{ "RequiredXp": 200, "Health": 50, "Regen": 0, "Armor": 1, "Damage": 3 },
	{ "RequiredXp": 300, "Health": 50, "Regen": 3.5, "Armor": 2, "Damage": 5 },
	{ "RequiredXp": 400, "Health": 50, "Regen": 3.5, "Armor": 3, "Damage": 8 },
	{ "RequiredXp": 500, "Health": 150, "Regen": 3.5, "Armor": 5, "Damage": 13 }
];

const STAR_RANK_MAX_LEVEL = STAR_RANK_DEFAULT_LEVELS.length;

function StarRankLevelSchema(n)
{
	return "<element name='Level" + n + "'>" +
		"<interleave>" +
			"<element name='RequiredXp'><data type='positiveInteger'/></element>" +
			"<element name='Health'><ref name='nonNegativeDecimal'/></element>" +
			"<element name='Regen'><ref name='nonNegativeDecimal'/></element>" +
			"<element name='Armor'><ref name='nonNegativeDecimal'/></element>" +
			"<element name='Damage'><ref name='nonNegativeDecimal'/></element>" +
		"</interleave>" +
	"</element>";
}

/**
 * Settlers 5 style star ranks (0 to 5). Registered under IID_Promotion so vanilla
 * XP sources, the experience bar and the GUI XP display work unchanged.
 */
StarRank.prototype.Schema =
	"<optional>" +
		"<element name='Levels'>" +
			"<interleave>" +
				[1, 2, 3, 4, 5].map(StarRankLevelSchema).join("") +
			"</interleave>" +
		"</element>" +
	"</optional>";

StarRank.prototype.Init = function()
{
	this.currentXp = 0;
	this.level = 0;
};

StarRank.prototype.GetLevelData = function(level)
{
	const data = this.template.Levels && this.template.Levels["Level" + level];
	if (!data)
		return STAR_RANK_DEFAULT_LEVELS[level - 1];
	return {
		"RequiredXp": +data.RequiredXp,
		"Health": +data.Health,
		"Regen": +data.Regen,
		"Armor": +data.Armor,
		"Damage": +data.Damage
	};
};

StarRank.prototype.GetLevel = function()
{
	return this.level;
};

StarRank.prototype.GetLevelName = function()
{
	return STAR_RANK_LEVEL_NAMES[this.level];
};

StarRank.prototype.GetCurrentXp = function()
{
	return this.currentXp;
};

/**
 * @return {number} XP needed to reach the next level, 0 at the maximum level.
 */
StarRank.prototype.GetRequiredXp = function()
{
	return this.level >= STAR_RANK_MAX_LEVEL ? 0 : this.GetLevelData(this.level + 1).RequiredXp;
};

StarRank.prototype.IncreaseXp = function(amount)
{
	if (this.level >= STAR_RANK_MAX_LEVEL)
		return;

	this.currentXp += +amount;
	const oldLevel = this.level;
	while (this.level < STAR_RANK_MAX_LEVEL && this.currentXp >= this.GetRequiredXp())
	{
		this.currentXp -= this.GetRequiredXp();
		++this.level;
	}
	if (this.level >= STAR_RANK_MAX_LEVEL)
		this.currentXp = 0;

	if (this.level != oldLevel)
		this.ApplyBonuses();

	Engine.PostMessage(this.entity, MT_ExperienceChanged, {});
};

StarRank.prototype.ApplyBonuses = function()
{
	const cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);
	cmpModifiersManager.RemoveAllModifiers("StarRank", this.entity);

	const data = this.GetLevelData(this.level);
	const modifiers = {};
	const add = (path, value) => {
		if (value)
			modifiers[path] = [{ "affects": [["Unit"]], "add": value }];
	};
	add("Health/Max", data.Health);
	add("Health/RegenRate", data.Regen);
	add("Resistance/Entity/Damage/Hack", data.Armor);
	add("Resistance/Entity/Damage/Pierce", data.Armor);
	add("Attack/Melee/Damage/Hack", data.Damage);
	cmpModifiersManager.AddModifiers("StarRank", modifiers, this.entity);
};

Engine.RegisterComponentType(IID_Promotion, "StarRank", StarRank);
