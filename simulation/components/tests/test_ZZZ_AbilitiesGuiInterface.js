Engine.LoadComponentScript("interfaces/Health.js");

// Minimal stand-in for the vanilla GuiInterface the mod wraps.
function GuiInterface() {}
GuiInterface.prototype.exposedFunctions = {};
GuiInterface.prototype.GetEntityState = () => ({});

Engine.LoadComponentScript("ZZZ_AbilitiesGuiInterface.js");

const hp = { 9: 10, 3: 5, 5: 0, 4: 7, 8: 7 };
const classes = { 9: true, 3: true, 5: true, 4: false, 8: true };
AddMock(SYSTEM_ENTITY, IID_RangeManager, {
	"GetEntitiesByPlayer": p => p == 1 ? [9, 4, 5, 3, 8] : []
});
for (const ent in hp)
{
	AddMock(+ent, IID_Identity, { "HasClass": c => c == "Superfighter" && classes[ent] });
	AddMock(+ent, IID_Health, { "GetHitpoints": () => hp[ent] });
}

const cmpGui = new GuiInterface();
TS_ASSERT_UNEVAL_EQUALS(cmpGui.GetPlayerSuperfighters(1), [3, 8, 9]);
TS_ASSERT_UNEVAL_EQUALS(cmpGui.GetPlayerSuperfighters(2), []);
TS_ASSERT(cmpGui.exposedFunctions.GetPlayerSuperfighters);
