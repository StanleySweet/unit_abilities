g_Commands.ability = function(player, cmd, data)
{
	for (const ent of data.entities || [])
	{
		const cmpAbilities = Engine.QueryInterface(ent, IID_Abilities);
		if (cmpAbilities)
			cmpAbilities.TriggerAbility(cmd.ability);
	}
};
