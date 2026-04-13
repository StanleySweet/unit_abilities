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
