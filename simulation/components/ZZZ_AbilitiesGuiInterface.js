{
	const superGetEntityState = GuiInterface.prototype.GetEntityState;

	GuiInterface.prototype.GetEntityState = function(player, ent)
	{
		const ret = superGetEntityState.call(this, player, ent);
		if (!ret)
			return ret;

		const cmpAbilities = Engine.QueryInterface(ent, IID_Abilities);
		if (cmpAbilities)
			ret.abilities = cmpAbilities.GetAbilityStates();

		return ret;
	};
}
