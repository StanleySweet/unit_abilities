function Infiltrator() {}

Infiltrator.prototype.Schema = "<empty/>";

Infiltrator.prototype.Init = function()
{
	this.active = false;
	this.target = INVALID_ENTITY;
	this.startTime = 0;
	this.duration = 0;
	this.resourceType = "";
	this.amount = 0;
	this.escapeDistance = 8;
	this.stolenFrom = INVALID_PLAYER;
	this.hiddenPosition = undefined;
	this.phase = "idle";
	this.entryPath = [];
	this.exitPath = [];
	this.pathIndex = 0;
	this.pathStepTime = 150;
	this.pathProximity = 0.75;
};

Infiltrator.prototype.IsInfiltrating = function()
{
	return this.active;
};

Infiltrator.prototype.GetProgress = function()
{
	if (!this.active || !this.duration)
		return 0;

	if (this.phase != "hidden")
		return 0;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpTimer)
		return 0;

	return Math.max(0, Math.min(1, (cmpTimer.GetTime() - this.startTime) / this.duration));
};

Infiltrator.prototype.GetStolenFrom = function()
{
	return this.stolenFrom;
};

Infiltrator.prototype.StartInfiltration = function(target, data)
{
	if (this.active || target === undefined || target == INVALID_ENTITY)
		return false;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpTimer)
		return false;

	this.active = true;
	this.phase = "starting";
	this.target = target;
	this.startTime = cmpTimer.GetTime();
	this.duration = Math.max(1, +data.duration || 5000);
	this.resourceType = data.resourceType || "metal";
	this.amount = Math.max(1, +data.amount || 1);
	this.escapeDistance = Math.max(0, +data.escapeDistance || 8);

	const cmpTargetOwnership = Engine.QueryInterface(target, IID_Ownership);
	this.stolenFrom = cmpTargetOwnership ? cmpTargetOwnership.GetOwner() : INVALID_PLAYER;
	this.entryPath = [];
	this.exitPath = [];
	this.pathIndex = 0;
	this.pathStepTime = 150;

	if (typeof IID_InfiltrationEntrance != "undefined")
	{
		const cmpInfiltrationEntrance = Engine.QueryInterface(target, IID_InfiltrationEntrance);
		if (cmpInfiltrationEntrance)
		{
			this.entryPath = cmpInfiltrationEntrance.GetEntryPath();
			this.exitPath = cmpInfiltrationEntrance.GetExitPath();
			this.pathStepTime = cmpInfiltrationEntrance.GetStepTime();
		}
	}

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI && typeof cmpUnitAI.Stop == "function")
		cmpUnitAI.Stop();

	if (this.entryPath.length)
		this.BeginEntryPath();
	else
		this.BeginHiddenInfiltration();

	return true;
};

Infiltrator.prototype.InfiltrationTick = function()
{
	if (!this.active)
		return;

	this.RegenerateStatusBars();
};

Infiltrator.prototype.BeginHiddenInfiltration = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpTimer)
		return;

	this.phase = "hidden";
	this.startTime = cmpTimer.GetTime();

	const cmpInfiltrationManager = typeof IID_InfiltrationManager == "undefined" ? null :
		Engine.QueryInterface(SYSTEM_ENTITY, IID_InfiltrationManager);
	if (cmpInfiltrationManager)
		cmpInfiltrationManager.Register(this.target, this.entity, this.startTime, this.duration);

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (cmpPosition && cmpPosition.IsInWorld())
	{
		this.hiddenPosition = cmpPosition.GetPosition2D();
		if (typeof cmpPosition.MoveOutOfWorld == "function")
			cmpPosition.MoveOutOfWorld();
	}

	this.timer = cmpTimer.SetInterval(this.entity, IID_Infiltrator, "InfiltrationTick", 200, 200, null);
	this.finishTimer = cmpTimer.SetTimeout(this.entity, IID_Infiltrator, "FinishInfiltration", this.duration, null);
	this.RegenerateStatusBars();
};

Infiltrator.prototype.BeginEntryPath = function()
{
	if (!this.active || !this.entryPath.length)
		return;

	const firstWaypoint = this.entryPath[0];
	if (!firstWaypoint)
	{
		this.BeginHiddenInfiltration();
		return;
	}

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	const currentPosition = cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : undefined;
	if (!currentPosition || currentPosition.distanceTo(firstWaypoint) <= this.pathProximity)
	{
		this.pathIndex = 0;
		this.ContinueEntryPath();
		return;
	}

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI && typeof cmpUnitAI.WalkToPointRange == "function")
	{
		cmpUnitAI.WalkToPointRange(firstWaypoint.x, firstWaypoint.y, 0, this.pathProximity, false, false);
		this.pathIndex = 0;
		this.WaitForEntryWaypoint();
		return;
	}

	this.pathIndex = 0;
	this.ContinueEntryPath();
};

Infiltrator.prototype.WaitForEntryWaypoint = function()
{
	if (!this.active || !this.entryPath.length)
		return;

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	const currentPosition = cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : undefined;
	if (currentPosition && currentPosition.distanceTo(this.entryPath[0]) <= this.pathProximity)
	{
		this.pathIndex = 1;
		this.ContinueEntryPath();
		return;
	}

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (cmpTimer)
		this.pathTimer = cmpTimer.SetTimeout(this.entity, IID_Infiltrator, "WaitForEntryWaypoint", 200, null);
};

Infiltrator.prototype.ContinueEntryPath = function()
{
	if (!this.active)
		return;

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (cmpPosition && this.pathIndex < this.entryPath.length)
	{
		const waypoint = this.entryPath[this.pathIndex++];
		cmpPosition.JumpTo(waypoint.x, waypoint.y);
	}

	if (this.pathIndex < this.entryPath.length)
	{
		const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
		if (cmpTimer)
			this.pathTimer = cmpTimer.SetTimeout(this.entity, IID_Infiltrator, "ContinueEntryPath", this.pathStepTime, null);
		return;
	}

	this.BeginHiddenInfiltration();
};

Infiltrator.prototype.FinishInfiltration = function()
{
	if (!this.active)
		return;

	const target = this.target;
	const escapeDistance = this.escapeDistance;

	this.CancelTimers();
	this.phase = "exiting";
	const cmpInfiltrationManager = typeof IID_InfiltrationManager == "undefined" ? null :
		Engine.QueryInterface(SYSTEM_ENTITY, IID_InfiltrationManager);
	if (cmpInfiltrationManager)
		cmpInfiltrationManager.Unregister(target, this.entity);
	const stolenAmount = this.StealResources();

	const cmpResourceGatherer = Engine.QueryInterface(this.entity, IID_ResourceGatherer);
	if (cmpResourceGatherer && stolenAmount > 0)
	{
		cmpResourceGatherer.DropResources();
		cmpResourceGatherer.GiveResources([{
			"type": this.resourceType,
			"amount": stolenAmount
		}]);
	}

	if (this.exitPath.length)
	{
		this.BeginVisibleExitPath();
		this.RegenerateStatusBars();
		return;
	}

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	const cmpTargetPosition = Engine.QueryInterface(target, IID_Position);
	const originPos = this.hiddenPosition || (cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null);
	if (cmpPosition && cmpTargetPosition && originPos && cmpTargetPosition.IsInWorld())
	{
		const targetPos = cmpTargetPosition.GetPosition2D();
		let direction = Vector2D.sub(originPos, targetPos);
		if (!direction.length())
			direction = new Vector2D(1, 0);
		else
			direction = direction.normalize();

		const escapePos = Vector2D.add(targetPos, direction.mult(escapeDistance));
		cmpPosition.JumpTo(escapePos.x, escapePos.y);
	}
	this.CompleteInfiltration();
};

Infiltrator.prototype.BeginVisibleExitPath = function()
{
	if (!this.active)
		return;

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !this.exitPath.length)
	{
		this.CompleteInfiltration();
		return;
	}

	const firstWaypoint = this.exitPath[0];
	cmpPosition.JumpTo(firstWaypoint.x, firstWaypoint.y);

	const cmpUnitAI = Engine.QueryInterface(this.entity, IID_UnitAI);
	if (cmpUnitAI && typeof cmpUnitAI.WalkToPointRange == "function")
	{
		for (let i = 1; i < this.exitPath.length; ++i)
		{
			const waypoint = this.exitPath[i];
			cmpUnitAI.WalkToPointRange(waypoint.x, waypoint.y, 0, 0, i > 1, false);
		}

		this.CompleteInfiltration();
		return;
	}

	this.pathIndex = 1;
	this.ContinueExitPathTeleportFallback();
};

Infiltrator.prototype.ContinueExitPathTeleportFallback = function()
{
	if (!this.active)
		return;

	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (cmpPosition && this.pathIndex < this.exitPath.length)
	{
		const waypoint = this.exitPath[this.pathIndex++];
		cmpPosition.JumpTo(waypoint.x, waypoint.y);
	}

	if (this.pathIndex < this.exitPath.length)
	{
		const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
		if (cmpTimer)
			this.pathTimer = cmpTimer.SetTimeout(this.entity, IID_Infiltrator, "ContinueExitPathTeleportFallback", this.pathStepTime, null);
		return;
	}

	this.pathTimer = undefined;
	this.CompleteInfiltration();
};

Infiltrator.prototype.CompleteInfiltration = function()
{
	this.active = false;
	this.phase = "idle";
	this.target = INVALID_ENTITY;
	this.hiddenPosition = undefined;
	this.entryPath = [];
	this.exitPath = [];
	this.pathIndex = 0;

	this.RegenerateStatusBars();
};

Infiltrator.prototype.StealResources = function()
{
	if (this.stolenFrom == INVALID_PLAYER ||
		typeof IID_PlayerManager == "undefined" ||
		typeof IID_Player == "undefined")
		return this.amount;

	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	if (!cmpPlayerManager)
		return this.amount;

	const playerEntity = cmpPlayerManager.GetPlayerByID(this.stolenFrom);
	const cmpPlayer = Engine.QueryInterface(playerEntity, IID_Player);
	if (!cmpPlayer || typeof cmpPlayer.GetResourceCounts != "function")
		return this.amount;

	const resourceCounts = cmpPlayer.GetResourceCounts();
	const available = Math.max(0, +(resourceCounts?.[this.resourceType] ?? 0));
	const stolenAmount = Math.min(this.amount, available);
	resourceCounts[this.resourceType] = available - stolenAmount;
	return stolenAmount;
};

Infiltrator.prototype.CancelTimers = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpTimer)
		return;

	if (this.timer)
	{
		cmpTimer.CancelTimer(this.timer);
		this.timer = undefined;
	}

	if (this.finishTimer)
	{
		cmpTimer.CancelTimer(this.finishTimer);
		this.finishTimer = undefined;
	}

	if (this.pathTimer)
	{
		cmpTimer.CancelTimer(this.pathTimer);
		this.pathTimer = undefined;
	}
};

Infiltrator.prototype.RegenerateStatusBars = function()
{
	this.RegenerateStatusBarsOn(this.entity);
	if (this.target != INVALID_ENTITY)
		this.RegenerateStatusBarsOn(this.target);
};

Infiltrator.prototype.RegenerateStatusBarsOn = function(entity)
{
	if (typeof IID_StatusBars == "undefined")
		return;

	const cmpStatusBars = Engine.QueryInterface(entity, IID_StatusBars);
	if (cmpStatusBars && typeof cmpStatusBars.RegenerateSprites == "function")
		cmpStatusBars.RegenerateSprites();
};

Infiltrator.prototype.OnDestroy = function()
{
	this.CancelTimers();
};

Engine.RegisterComponentType(IID_Infiltrator, "Infiltrator", Infiltrator);
