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
	return this.ResolveWaypoints(this.template.EntryWaypoints);
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
