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

	GuiInterface.prototype.SetAbilityPlacementPreview = function(player, cmd)
	{
		if (!this.abilityPlacementEntity || this.abilityPlacementEntity[0] != cmd.template)
		{
			if (this.abilityPlacementEntity)
				Engine.DestroyEntity(this.abilityPlacementEntity[1]);

			if (!cmd.template)
				this.abilityPlacementEntity = undefined;
			else
				this.abilityPlacementEntity = [cmd.template, Engine.AddLocalEntity(cmd.template)];
		}

		if (!this.abilityPlacementEntity)
			return;

		const ent = this.abilityPlacementEntity[1];
		const cmpPosition = Engine.QueryInterface(ent, IID_Position);
		if (cmpPosition)
		{
			cmpPosition.JumpTo(cmd.x, cmd.z);
			cmpPosition.SetYRotation(cmd.angle || 0);
		}

		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		if (cmpOwnership)
			cmpOwnership.SetOwner(player);
	};

	GuiInterface.prototype.exposedFunctions.SetAbilityPlacementPreview = 1;
}
