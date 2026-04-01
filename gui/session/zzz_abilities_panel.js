function performAbility(abilityName)
{
	Engine.PostNetworkCommand({
		"type": "ability",
		"entities": g_Selection.toList(),
		"ability": abilityName
	});
}

function getSharedAbilities(unitEntStates)
{
	if (!unitEntStates.length || !unitEntStates[0].abilities || !unitEntStates[0].abilities.length)
		return [];

	return unitEntStates[0].abilities.filter(ability =>
		unitEntStates.every(state => state.abilities && state.abilities.some(candidate => candidate.name == ability.name)));
}

g_unitPanelButtons.Abilities = 0;

g_SelectionPanels.Abilities = {
	"getMaxNumberOfItems": function()
	{
		return 10;
	},
	"rowLength": 10,
	"getItems": function(unitEntStates)
	{
		return getSharedAbilities(unitEntStates);
	},
	"setupButton": function(data)
	{
		const abilities = data.unitEntStates.map(state =>
			state.abilities.find(ability => ability.name == data.item.name));
		const cooldownRemaining = Math.max(...abilities.map(ability => ability.cooldownRemaining));

		data.button.onPress = function()
		{
			performAbility(data.item.name);
		};

		data.button.enabled = controlsPlayer(data.player) && !data.item.autoTrigger && cooldownRemaining === 0;
		const modifier = data.item.autoTrigger ? "" : data.button.enabled ? "" : "color:0 0 0 127:grayscale:";
		data.icon.sprite = modifier + "stretched:session/portraits/" + data.item.icon;
		data.countDisplay.caption = cooldownRemaining ? Math.ceil(cooldownRemaining / 1000) : data.item.autoTrigger ? translate("AUTO") : "";

		const tooltip = [];
		tooltip.push(headerFont(translate(data.item.name)));
		tooltip.push(bodyFont(sprintf(translate("Action: %(action)s"), {
			"action": translate(data.item.action)
		})));
		if (data.item.tooltip)
			tooltip.push(bodyFont(translate(data.item.tooltip)));
		if (data.item.autoTrigger)
			tooltip.push(bodyFont(sprintf(translate("Auto-trigger: every %(seconds)s seconds"), {
				"seconds": Math.ceil(data.item.autoTriggerInterval / 1000)
			})));
		if (data.item.autoTrigger)
			tooltip.push(bodyFont(translate("This ability triggers automatically and cannot be activated manually.")));
		tooltip.push(bodyFont(sprintf(
			cooldownRemaining ?
				translate("Cooldown remaining: %(seconds)s seconds") :
				translate("Cooldown: %(seconds)s seconds"),
			{ "seconds": Math.ceil((cooldownRemaining || data.item.cooldown) / 1000) })));
		data.button.tooltip = tooltip.join("\n");

		setPanelObjectPosition(data.button, data.i, data.rowLength);
		return true;
	}
};

{
	const superGetNumberOfRightPanelButtons = getNumberOfRightPanelButtons;
	getNumberOfRightPanelButtons = function()
	{
		return superGetNumberOfRightPanelButtons() + (g_SelectionPanels.Abilities.used ? g_SelectionPanels.Abilities.rowLength : 0);
	};
}

g_PanelsOrder.splice(g_PanelsOrder.indexOf("Training"), 0, "Abilities");
