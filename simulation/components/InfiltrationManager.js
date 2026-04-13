function InfiltrationManager() {}

InfiltrationManager.prototype.Schema = "<a:component type='system'/><empty/>";

InfiltrationManager.prototype.Init = function()
{
	this.entriesByTarget = new Map();
};

InfiltrationManager.prototype.Register = function(target, source, startTime, duration)
{
	if (target == INVALID_ENTITY || source == INVALID_ENTITY)
		return;

	if (!this.entriesByTarget.has(target))
		this.entriesByTarget.set(target, new Map());

	this.entriesByTarget.get(target).set(source, {
		"startTime": startTime,
		"duration": duration
	});
};

InfiltrationManager.prototype.Unregister = function(target, source)
{
	const entries = this.entriesByTarget.get(target);
	if (!entries)
		return;

	entries.delete(source);
	if (!entries.size)
		this.entriesByTarget.delete(target);
};

InfiltrationManager.prototype.GetTargetProgress = function(target)
{
	const entries = this.entriesByTarget.get(target);
	if (!entries || !entries.size)
		return 0;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpTimer)
		return 0;

	const time = cmpTimer.GetTime();
	let progress = 0;

	for (const entry of entries.values())
	{
		if (!entry.duration)
			continue;

		progress = Math.max(progress, Math.max(0, Math.min(1, (time - entry.startTime) / entry.duration)));
	}

	return progress;
};

Engine.RegisterSystemComponentType(IID_InfiltrationManager, "InfiltrationManager", InfiltrationManager);
