function WaypointRecorder() {}

WaypointRecorder.prototype.Schema = "<empty/>";

WaypointRecorder.prototype.Init = function()
{
	this.entryWaypoints = [];
	this.exitWaypoints = [];
};

WaypointRecorder.prototype.GetEntityPosition2D = function()
{
	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return undefined;

	return cmpPosition.GetPosition2D();
};

WaypointRecorder.prototype.GetWaypointList = function(kind)
{
	return kind == "exit" ? this.exitWaypoints : this.entryWaypoints;
};

WaypointRecorder.prototype.FormatWaypoint = function(point)
{
	const x = Math.round(point.x * 100) / 100;
	const y = Math.round(point.y * 100) / 100;
	return x + " " + y;
};

WaypointRecorder.prototype.FormatWaypointList = function(kind)
{
	return this.GetWaypointList(kind).map(point => this.FormatWaypoint(point)).join("; ");
};

WaypointRecorder.prototype.RecordWaypoint = function(kind, worldPosition)
{
	const origin = this.GetEntityPosition2D();
	if (!origin || !worldPosition)
		return false;

	const relative = Vector2D.sub(worldPosition, origin);
	this.GetWaypointList(kind).push(relative);

	warn(
		"[WaypointRecorder] entity=" + this.entity +
		" kind=" + kind +
		" point=" + this.FormatWaypoint(relative) +
		" sequence=" + this.FormatWaypointList(kind)
	);
	return true;
};

WaypointRecorder.prototype.ClearWaypoints = function(kind)
{
	this.GetWaypointList(kind).length = 0;
	warn("[WaypointRecorder] entity=" + this.entity + " kind=" + kind + " cleared");
	return true;
};

Engine.RegisterComponentType(IID_WaypointRecorder, "WaypointRecorder", WaypointRecorder);
