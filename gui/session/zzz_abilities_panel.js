var g_AbilityTargetSelection = undefined;
var g_AbilityPreSelectedActionPrefix = "ability:";

function getAbilityPointTargetState(selection)
{
	const ability = getActiveAbilitySelection(selection);
	if (!ability || !ability.target || ability.target.type != "point")
		return undefined;

	return ability.target;
}

function getFirstSelectionPosition2D(selection)
{
	if (!selection || !selection.length)
		return undefined;

	const casterState = GetEntityState(selection[0]);
	if (!casterState || !casterState.position)
		return undefined;

	return Vector2D.from3D(casterState.position);
}

function isAbilityPointInRange(selection, position2D)
{
	const target = getAbilityPointTargetState(selection);
	if (!target || target.range === undefined || target.range <= 0)
		return true;

	const sourcePosition = getFirstSelectionPosition2D(selection);
	if (!sourcePosition || !position2D)
		return false;

	return sourcePosition.distanceTo(position2D) <= target.range;
}

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

	const position2D = Vector2D.from3D(position);
	const selection = g_Selection.toList();
	if (!isAbilityPointInRange(selection, position2D))
	{
		Engine.GuiInterfaceCall("SetAbilityPlacementPreview", { "template": "" });
		return;
	}

	let angle = 0;
	if (selection.length)
	{
		const casterState = GetEntityState(selection[0]);
		if (casterState && casterState.position)
			angle = Vector2D.from3D(casterState.position).angleTo(position2D);
	}

	angle += g_AbilityTargetSelection.target.previewAngleOffset || 0;

	Engine.GuiInterfaceCall("SetAbilityPlacementPreview", {
		"template": g_AbilityTargetSelection.target.previewTemplate,
		"x": position.x,
		"z": position.z,
		"angle": angle
	});
}

// Superfighter whose abilities are shown while several are selected (Settlers 5 "shown fighter").
var g_AbilityFocus = undefined;
var g_AbilityFocusSelection = "";

/**
 * @return {number|undefined} The focused entity while the selection is unchanged since it was set.
 */
function getAbilityFocus()
{
	const selection = g_Selection.toList();
	if (g_AbilityFocus === undefined || g_AbilityFocusSelection != selection.join(",") ||
		selection.indexOf(g_AbilityFocus) == -1)
		g_AbilityFocus = undefined;
	return g_AbilityFocus;
}

function cycleAbilityFocus()
{
	const selection = g_Selection.toList().filter(ent => {
		const state = GetEntityState(ent);
		return state && state.identity && state.identity.classes.indexOf("Superfighter") != -1;
	});
	if (selection.length < 2)
		return;

	const current = selection.indexOf(getAbilityFocus());
	g_AbilityFocus = selection[(current + 1) % selection.length];
	g_AbilityFocusSelection = g_Selection.toList().join(",");
	cancelAbilityTargetSelection();
	updateGUIObjects();
}

var g_LastSuperfighter = INVALID_ENTITY;

function findNextSuperfighter()
{
	const fighters = Engine.GuiInterfaceCall("GetPlayerSuperfighters", g_ViewedPlayer);
	if (!fighters.length)
		return;

	g_LastSuperfighter = fighters.find(ent => ent > g_LastSuperfighter) || fighters[0];
	g_Selection.reset();
	g_Selection.addList([g_LastSuperfighter]);

	const entityState = GetEntityState(g_LastSuperfighter);
	if (entityState && entityState.position)
		Engine.CameraMoveTo(entityState.position.x, entityState.position.z);
}

function postAbilityCommand(abilityName, extraData, selection, queued, pushFront)
{
	const focus = getAbilityFocus();
	const command = {
		"type": "ability",
		"entities": focus !== undefined ? [focus] : selection || g_Selection.toList(),
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

	// Mirage GUI states may not carry the full identity payload.
	// Let the simulation perform the authoritative class validation.
	if (targetState && targetState.mirage && !targetState.identity)
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

	if (targetState && targetState.mirage && !targetState.identity)
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

	// Mirage entity states are often incomplete in the session layer.
	// Let the simulation validate player/class/range against the resolved parent.
	if (targetState.mirage)
		return true;

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
		const position2D = position ? Vector2D.from3D(position) : undefined;
		if (!isAbilityPointInRange(selection, position2D))
		{
			Engine.GuiInterfaceCall("SetAbilityPlacementPreview", { "template": "" });
			return true;
		}

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
	const focus = getAbilityFocus();
	if (focus !== undefined)
		unitEntStates = unitEntStates.filter(state => state.id == focus);

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

const MOOD_TEXTS = {
	"happy": markForTranslation("is happy, because he was promoted"),
	"angry": markForTranslation("is angry, because he was demoted"),
	"sad": markForTranslation("is sad because he was killed so often without reaching a higher rank"),
	"bored": markForTranslation("is bored, because he can't fight")
};

{
	const superDisplaySingle = displaySingle;
	displaySingle = function(entState)
	{
		superDisplaySingle(entState);

		if (!entState.moods || !entState.moods.length)
			return;

		const border = Engine.GetGUIObjectByName("iconBorder");
		const mood = entState.moods[entState.moods.length - 1];
		border.tooltip += (border.tooltip ? "\n" : "") + sprintf(translate("%(name)s %(mood)s"), {
			"name": entState.identity.selectionGroupName ? translate(entState.identity.selectionGroupName) : translate(entState.identity.genericName),
			"mood": translate(MOOD_TEXTS[mood])
		});
	};
}

g_PanelsOrder.splice(g_PanelsOrder.indexOf("Upgrade"), 0, "Abilities");
