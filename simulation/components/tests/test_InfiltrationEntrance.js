Engine.LoadComponentScript("interfaces/InfiltrationEntrance.js");
Engine.LoadComponentScript("InfiltrationEntrance.js");

const building = 701;

AddMock(building, IID_Position, {
	"IsInWorld": () => true,
	"GetPosition2D": () => new Vector2D(20, 30)
});

const cmpEntrance = ConstructComponent(building, "InfiltrationEntrance", {
	"StepTime": "600",
	"EntryWaypoints": "1 0; 2 1"
});

TS_ASSERT_EQUALS(cmpEntrance.GetStepTime(), 600);
TS_ASSERT_UNEVAL_EQUALS(cmpEntrance.GetEntryPath().map(point => [point.x, point.y]), [[21, 30], [22, 31]]);
TS_ASSERT_UNEVAL_EQUALS(cmpEntrance.GetExitPath().map(point => [point.x, point.y]), [[22, 31], [21, 30]]);
TS_ASSERT_UNEVAL_EQUALS(cmpEntrance.ParseWaypointPairs("3 4; 5,6; nope").map(point => [point.x, point.y]), [[3, 4], [5, 6]]);
