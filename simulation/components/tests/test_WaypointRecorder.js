Engine.LoadComponentScript("interfaces/WaypointRecorder.js");
Engine.LoadComponentScript("WaypointRecorder.js");

const building = 501;
let inWorld = true;

AddMock(building, IID_Position, {
	"IsInWorld": () => inWorld,
	"GetPosition2D": () => new Vector2D(100, 200)
});

const cmpWaypointRecorder = ConstructComponent(building, "WaypointRecorder");
TS_ASSERT(cmpWaypointRecorder.RecordWaypoint("entry", new Vector2D(92, 200)));
TS_ASSERT(cmpWaypointRecorder.RecordWaypoint("entry", new Vector2D(96, 201.5)));
TS_ASSERT_EQUALS(cmpWaypointRecorder.FormatWaypointList("entry"), "-8 0; -4 1.5");

TS_ASSERT(cmpWaypointRecorder.RecordWaypoint("exit", new Vector2D(88, 200)));
TS_ASSERT_EQUALS(cmpWaypointRecorder.FormatWaypointList("exit"), "-12 0");

TS_ASSERT(cmpWaypointRecorder.ClearWaypoints("entry"));
TS_ASSERT_EQUALS(cmpWaypointRecorder.FormatWaypointList("entry"), "");

inWorld = false;
TS_ASSERT(!cmpWaypointRecorder.RecordWaypoint("entry", new Vector2D(90, 200)));
