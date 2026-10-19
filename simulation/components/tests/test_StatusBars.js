Engine.LoadComponentScript("interfaces/Infiltrator.js");
Engine.LoadComponentScript("interfaces/InfiltrationManager.js");
Engine.LoadComponentScript("interfaces/StatusBars.js");
Engine.LoadComponentScript("StatusBars.js");

const infiltratingEntity = 501;
let sprites = [];

AddMock(infiltratingEntity, IID_Infiltrator, {
	"IsInfiltrating": () => true,
	"GetProgress": () => 0.6
});

const cmpStatusBars = ConstructComponent(infiltratingEntity, "StatusBars", {
	"BarWidth": 2,
	"BarHeight": 1,
	"HeightOffset": 7
});

cmpStatusBars.enabled = true;
cmpStatusBars.AddInfiltrationBar({
	"AddSprite": (...args) => sprites.push(args)
}, 0);

TS_ASSERT_EQUALS(sprites.length, 2);
TS_ASSERT_EQUALS(sprites[0][0], "art/textures/ui/session/icons/upgrade_bg.png");
TS_ASSERT_EQUALS(sprites[1][0], "art/textures/ui/session/icons/upgrade_fg.png");

DeleteMock(infiltratingEntity, IID_Infiltrator);
sprites = [];

AddMock(SYSTEM_ENTITY, IID_InfiltrationManager, {
	"GetTargetProgress": entity => entity == infiltratingEntity ? 0.6 : 0
});

cmpStatusBars.AddInfiltrationBar({
	"AddSprite": (...args) => sprites.push(args)
}, 0);

TS_ASSERT_EQUALS(sprites.length, 2);
TS_ASSERT_EQUALS(sprites[0][0], "art/textures/ui/session/icons/upgrade_bg.png");
TS_ASSERT_EQUALS(sprites[1][0], "art/textures/ui/session/icons/upgrade_fg.png");

// Rank icon: star icon for StarRank levels > 0, Identity rank otherwise.
const rankEntity = 502;
Engine.LoadComponentScript("interfaces/Promotion.js");
Engine.LoadComponentScript("interfaces/Identity.js");
let starLevel = 0;
AddMock(rankEntity, IID_Promotion, { "GetLevel": () => starLevel });
AddMock(rankEntity, IID_Identity, { "GetRank": () => "Elite" });
const cmpRankBars = ConstructComponent(rankEntity, "StatusBars", { "BarWidth": 2, "BarHeight": 1, "HeightOffset": 7 });
cmpRankBars.enabled = true;
cmpRankBars.showRank = true;
const rankSprites = [];
const rankRenderer = { "AddSprite": (...args) => rankSprites.push(args) };
cmpRankBars.AddRankIcon(rankRenderer, 0);
starLevel = 3;
cmpRankBars.AddRankIcon(rankRenderer, 0);
TS_ASSERT_EQUALS(rankSprites[0][0], "art/textures/ui/session/icons/ranks/Elite.png");
TS_ASSERT_EQUALS(rankSprites[1][0], "art/textures/ui/session/icons/ranks/star_3.png");
// Star icons are 4:1 (64x16): twice as wide as a square rank icon, half as tall as BarWidth/2 * 2.
TS_ASSERT_UNEVAL_EQUALS(rankSprites[0][1], { "x": -0.5, "y": 0 });
TS_ASSERT_UNEVAL_EQUALS(rankSprites[0][2], { "x": 0.5, "y": 1 });
TS_ASSERT_UNEVAL_EQUALS(rankSprites[1][1], { "x": -1, "y": 0 });
TS_ASSERT_UNEVAL_EQUALS(rankSprites[1][2], { "x": 1, "y": 0.5 });
