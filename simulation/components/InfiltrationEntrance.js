function InfiltrationEntrance() {}

InfiltrationEntrance.prototype.Schema =
	"<optional>" +
		"<element name='StepTime' a:help='Milliseconds between scripted waypoint hops.'>" +
			"<ref name='nonNegativeDecimal'/>" +
		"</element>" +
	"</optional>" +
	"<optional>" +
		"<element name='EntryWaypoints' a:help='Semicolon-separated local waypoint pairs such as -4 0; -1.5 0; 2 0'>" +
			"<text/>" +
		"</element>" +
	"</optional>" +
	"<optional>" +
		"<element name='ReverseEntryWaypoints' a:help='Whether the entry waypoint sequence should be traversed in reverse order.'>" +
			"<data type='boolean'/>" +
		"</element>" +
	"</optional>" +
	"<optional>" +
		"<element name='EntryJumpAfterApproach' a:help='Which entry waypoint should be used for the obstruction-crossing jump after the infiltrator reaches the first approach point.'>" +
			"<choice>" +
				"<value>next</value>" +
				"<value>last</value>" +
			"</choice>" +
		"</element>" +
	"</optional>" +
	"<optional>" +
		"<element name='EntryInterpolationSpacing' a:help='Optional maximum spacing, in meters, used to insert extra intermediate hops along the entry path.'>" +
			"<ref name='positiveDecimal'/>" +
		"</element>" +
	"</optional>" +
	"<optional>" +
		"<element name='ExitWaypoints' a:help='Semicolon-separated local waypoint pairs such as -4 0; -8 0; -12 0'>" +
			"<text/>" +
		"</element>" +
	"</optional>";

InfiltrationEntrance.prototype.GetStepTime = function()
{
	return Math.max(1, +(this.template.StepTime || 150));
};

InfiltrationEntrance.prototype.GetEntryPath = function()
{
	let entryPath = this.ResolveWaypoints(this.template.EntryWaypoints);
	if (this.template.ReverseEntryWaypoints == "true")
		entryPath = entryPath.slice().reverse();

	return this.InterpolatePath(entryPath, +(this.template.EntryInterpolationSpacing || 0));
};

InfiltrationEntrance.prototype.GetEntryJumpAfterApproach = function()
{
	return this.template.EntryJumpAfterApproach || "next";
};

InfiltrationEntrance.prototype.GetExitPath = function()
{
	const exitPath = this.ResolveWaypoints(this.template.ExitWaypoints);
	if (exitPath.length)
		return exitPath;

	return this.GetEntryPath().slice().reverse();
};

InfiltrationEntrance.prototype.ResolveWaypoints = function(waypoints)
{
	if (!waypoints)
		return [];

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return [];

	const origin = cmpPosition.GetPosition2D();
	return this.ParseWaypointPairs(waypoints).map(waypoint => Vector2D.add(origin, waypoint));
};

InfiltrationEntrance.prototype.InterpolatePath = function(path, spacing)
{
	if (!path || path.length < 2 || !(spacing > 0))
		return path ? path.slice() : [];

	const interpolated = [path[0]];
	for (let i = 1; i < path.length; ++i)
	{
		const start = path[i - 1];
		const end = path[i];
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const segments = Math.max(1, Math.ceil(distance / spacing));

		for (let step = 1; step <= segments; ++step)
		{
			const t = step / segments;
			interpolated.push(new Vector2D(
				start.x + dx * t,
				start.y + dy * t
			));
		}
	}

	return interpolated;
};

InfiltrationEntrance.prototype.ParseWaypointPairs = function(waypoints)
{
	if (!waypoints)
		return [];

	if (typeof waypoints != "string")
		return [];

	return waypoints
		.split(";")
		.map(entry => entry.trim())
		.filter(Boolean)
		.map(entry => entry.split(/[\s,]+/).filter(Boolean))
		.filter(parts => parts.length >= 2)
		.map(parts => new Vector2D(+parts[0], +parts[1]))
		.filter(point => !Number.isNaN(point.x) && !Number.isNaN(point.y));
};

Engine.RegisterComponentType(IID_InfiltrationEntrance, "InfiltrationEntrance", InfiltrationEntrance);
