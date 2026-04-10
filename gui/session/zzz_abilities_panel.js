var g_AbilityTargetSelection = undefined;
var g_AbilityPreSelectedActionPrefix = "ability:";

function updateAbilityPlacementPreview()
{
	if (!g_AbilityTargetSelection ||
		!g_AbilityTargetSelection.target ||
		g_AbilityTargetSelection.target.type != "point" ||
		!g_AbilityTargetSelection.target.previewTemplate)
	{
		Engine.GuiInterfaceCall("SetAbilityPlacementPreview", { "template": "" });
		return;
	}

	const position = Engine.GetTerrainAtScreenPoint(mouseX, mouseY);
	if (!position)
		return;

	Engine.GuiInterfaceCall("SetAbilityPlacementPreview", {
		"template": g_AbilityTargetSelection.target.previewTemplate,
		"x": position.x,
		"z": position.z,
		"angle": 0
	});
}

function postAbilityCommand(abilityName, extraData, selection, queued, pushFront)
{
	const command = {
		"type": "ability",
		"entities": selection || g_Selection.toList(),
		"ability": abilityName,
		"queued": !!queued,
		"pushFront": !!pushFront
	};

	if (extraData)
		for (const key in extraData)
			command[key] = extraData[key];

	Engine.PostNetworkCommand(command);
}

function getAbilityPreSelectedAction(ability)
{
	if (!ability || !ability.target || !ability.target.type || ability.target.type == "none")
		return undefined;

	return g_AbilityPreSelectedActionPrefix + ability.target.type;
}

function cancelAbilityTargetSelection()
{
	if (!g_AbilityTargetSelection)
		return;

	g_AbilityTargetSelection = undefined;
	Engine.GuiInterfaceCall("SetAbilityPlacementPreview", { "template": "" });
	if (String(preSelectedAction).indexOf(g_AbilityPreSelectedActionPrefix) == 0)
		preSelectedAction = ACTION_NONE;
	if (inputState == INPUT_PRESELECTEDACTION)
		inputState = INPUT_NORMAL;
}

function performAbility(ability)
{
	if (!ability.target || ability.target.type == "none")
	{
		postAbilityCommand(ability.name);
		return;
	}

	g_AbilityTargetSelection = ability;
	preSelectedAction = getAbilityPreSelectedAction(ability);
	inputState = INPUT_PRESELECTEDACTION;
	updateAbilityPlacementPreview();
}

function getActiveAbilitySelection(selection)
{
	if (!g_AbilityTargetSelection || !selection || !selection.length)
		return undefined;

	const entState = GetEntityState(selection[0]);
	if (!entState || !entState.abilities)
		return undefined;

	const activeAbility = entState.abilities.find(ability => ability.name == g_AbilityTargetSelection.name);
	if (!activeAbility || !activeAbility.target || activeAbility.target.type != g_AbilityTargetSelection.target.type)
		return undefined;

	return activeAbility;
}

function abilityTargetClassesMatch(targetState, classes)
{
	if (!classes)
		return true;

	const requiredClasses = classes.split(/\s+/).filter(Boolean);
	if (!requiredClasses.length)
		return true;

	return !!targetState && !!targetState.identity && requiredClasses.every(className =>
		targetState.identity.classes && targetState.identity.classes.indexOf(className) != -1);
}

function abilityTargetRestrictedClassesMatch(targetState, classes)
{
	if (!classes)
		return true;

	const restrictedClasses = classes.split(/\s+/).filter(Boolean);
	if (!restrictedClasses.length)
		return true;

	return !targetState || !targetState.identity || !restrictedClasses.some(className =>
		targetState.identity.classes && targetState.identity.classes.indexOf(className) != -1);
}

function abilityTargetPlayersMatch(selectionState, targetState, players)
{
	if (!players)
		return true;

	const validPlayers = players.split(/\s+/).filter(Boolean);
	if (!validPlayers.length)
		return true;

	return playerCheck(selectionState, targetState, validPlayers);
}

function abilityEntityTargetMatches(target, selection)
{
	if (!target)
		return false;

	const ability = getActiveAbilitySelection(selection);
	if (!ability || !ability.target || ability.target.type != "entity")
		return false;

	const selectionState = GetEntityState(selection[0]);
	const targetState = GetEntityState(target);
	if (!selectionState || !targetState)
		return false;

	if (!ability.target.allowSelf && selection.indexOf(target) != -1)
		return false;

	if (!abilityTargetPlayersMatch(selectionState, targetState, ability.target.players))
		return false;

	if (!abilityTargetClassesMatch(targetState, ability.target.classes))
		return false;

	if (!abilityTargetRestrictedClassesMatch(targetState, ability.target.restrictedClasses))
		return false;

	return true;
}

function getAbilityCursor(ability, fallbackCursor)
{
	if (ability && ability.target && ability.target.cursor)
		return ability.target.cursor;

	return fallbackCursor;
}

g_UnitActions["ability-target-point"] = {
	"execute": function(position, action, selection, queued, pushFront)
	{
		postAbilityCommand(action.abilityName, {
			"position": position
		}, selection, queued, pushFront);
		cancelAbilityTargetSelection();
		return true;
	},
	"preSelectedActionCheck": function(target, selection)
	{
		const ability = getActiveAbilitySelection(selection);
		if (!ability || preSelectedAction != g_AbilityPreSelectedActionPrefix + "point")
			return false;

		return {
			"type": "ability-target-point",
			"cursor": getAbilityCursor(ability, "action-attack"),
			"abilityName": ability.name,
			"firstAbleEntity": selection[0]
		};
	},
	"specificness": 1
};

g_UnitActions["ability-target-entity"] = {
	"execute": function(position, action, selection, queued, pushFront)
	{
		postAbilityCommand(action.abilityName, {
			"target": action.target
		}, selection, queued, pushFront);
		cancelAbilityTargetSelection();
		return true;
	},
	"preSelectedActionCheck": function(target, selection)
	{
		const ability = getActiveAbilitySelection(selection);
		if (!ability || preSelectedAction != g_AbilityPreSelectedActionPrefix + "entity")
			return false;

		if (!abilityEntityTargetMatches(target, selection))
			return {
				"type": "none",
				"cursor": getAbilityCursor(ability, "action-attack-disabled"),
				"target": null
			};

		return {
			"type": "ability-target-entity",
			"cursor": getAbilityCursor(ability, "action-attack"),
			"abilityName": ability.name,
			"target": target,
			"firstAbleEntity": selection[0]
		};
	},
	"specificness": 1
};

for (const action of ["ability-target-point", "ability-target-entity"])
	if (g_UnitActionsSortedKeys.indexOf(action) == -1)
		g_UnitActionsSortedKeys.push(action);

g_UnitActionsSortedKeys.sort((a, b) => g_UnitActions[a].specificness - g_UnitActions[b].specificness);

{
	const superHandleInputBeforeGui = handleInputBeforeGui;
	handleInputBeforeGui = function(ev)
	{
		if (g_AbilityTargetSelection && (!g_Selection.size() || !getActiveAbilitySelection(g_Selection.toList())))
			cancelAbilityTargetSelection();

		if (g_AbilityTargetSelection && ev.type == "mousemotion")
			updateAbilityPlacementPreview();

		return superHandleInputBeforeGui(ev);
	};
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
			performAbility(data.item);
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
		if (data.item.target && data.item.target.type == "entity")
			tooltip.push(bodyFont(translate("Click the ability, then right-click a unit or entity target.")));
		if (data.item.target && data.item.target.type == "point")
			tooltip.push(bodyFont(translate("Click the ability, then right-click a ground target.")));
		if (data.item.target && data.item.target.range)
			tooltip.push(bodyFont(sprintf(translate("Target range: %(range)s meters"), {
				"range": Math.ceil(data.item.target.range)
			})));
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
	const superHandleInputAfterGui = handleInputAfterGui;
	handleInputAfterGui = function(ev)
	{
		if (g_AbilityTargetSelection && inputState == INPUT_PRESELECTEDACTION && preSelectedAction != ACTION_NONE)
		{
			if (ev.type == "mousebuttondown" && ev.button == SDL_BUTTON_RIGHT)
			{
				const action = determineAction(ev.x, ev.y);
				if (!action)
					return false;

				if (!Engine.HotkeyIsPressed("session.queue") && !Engine.HotkeyIsPressed("session.orderone"))
					cancelAbilityTargetSelection();

				return doAction(action, ev);
			}

			if (ev.type == "mousebuttondown" && ev.button == SDL_BUTTON_LEFT)
			{
				cancelAbilityTargetSelection();
				g_DragStart = new Vector2D(ev.x, ev.y);
				inputState = INPUT_SELECTING;
				if (ev.clicks == 1 || clickedEntity == INVALID_ENTITY)
					clickedEntity = Engine.PickEntityAtPoint(ev.x, ev.y);
				return true;
			}
		}

		return superHandleInputAfterGui(ev);
	};
}

{
	const superGetNumberOfRightPanelButtons = getNumberOfRightPanelButtons;
	getNumberOfRightPanelButtons = function()
	{
		return superGetNumberOfRightPanelButtons() + (g_SelectionPanels.Abilities.used ? g_SelectionPanels.Abilities.rowLength : 0);
	};
}

g_PanelsOrder.splice(g_PanelsOrder.indexOf("Training"), 0, "Abilities");
