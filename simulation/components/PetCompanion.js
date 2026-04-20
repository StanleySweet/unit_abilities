function PetCompanion() {}

PetCompanion.prototype.Schema =
	"<element name='Template'>" +
		"<text/>" +
	"</element>" +
	"<optional><element name='WanderInterval'><ref name='nonNegativeDecimal'/></element></optional>" +
	"<optional><element name='WanderMinRange'><ref name='nonNegativeDecimal'/></element></optional>" +
	"<optional><element name='WanderMaxRange'><ref name='nonNegativeDecimal'/></element></optional>" +
	"<optional><element name='LeashRadius'><ref name='nonNegativeDecimal'/></element></optional>" +
	"<optional><element name='DirectedRange'><ref name='nonNegativeDecimal'/></element></optional>" +
	"<optional><element name='DirectedLoiterTime'><ref name='nonNegativeDecimal'/></element></optional>" +
	"<optional><element name='ApproachRange'><ref name='nonNegativeDecimal'/></element></optional>";

PetCompanion.prototype.Init = function()
{
	this.pet = INVALID_ENTITY;
	this.wanderTarget = undefined;
	this.commandTarget = undefined;
	this.nextWanderUpdateTime = 0;
	this.timer = undefined;
	this.StartTimer();
};

PetCompanion.prototype.GetNumericTemplateValue = function(name, fallback)
{
	return this.template[name] !== undefined ? +this.template[name] : fallback;
};

PetCompanion.prototype.GetWanderInterval = function()
{
	return this.GetNumericTemplateValue("WanderInterval", 1500);
};

PetCompanion.prototype.GetWanderMinRange = function()
{
	return this.GetNumericTemplateValue("WanderMinRange", 8);
};

PetCompanion.prototype.GetWanderMaxRange = function()
{
	return this.GetNumericTemplateValue("WanderMaxRange", 16);
};

PetCompanion.prototype.GetLeashRadius = function()
{
	return this.GetNumericTemplateValue("LeashRadius", 24);
};

PetCompanion.prototype.GetDirectedRange = function()
{
	return this.GetNumericTemplateValue("DirectedRange", 40);
};

PetCompanion.prototype.GetDirectedLoiterTime = function(data)
{
	if (data && data.LoiterTime !== undefined)
		return +data.LoiterTime;

	return this.GetNumericTemplateValue("DirectedLoiterTime", 6000);
};

PetCompanion.prototype.GetApproachRange = function()
{
	return this.GetNumericTemplateValue("ApproachRange", 3);
};

PetCompanion.prototype.GetTime = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	return cmpTimer && cmpTimer.GetTime ? cmpTimer.GetTime() : 0;
};

PetCompanion.prototype.StartTimer = function()
{
	if (this.timer)
		return;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (!cmpTimer)
		return;

	const interval = this.GetWanderInterval();
	this.timer = cmpTimer.SetInterval(this.entity, IID_PetCompanion, "Tick", interval, interval, null);
};

PetCompanion.prototype.StopTimer = function()
{
	if (!this.timer)
		return;

	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	if (cmpTimer)
		cmpTimer.CancelTimer(this.timer);

	this.timer = undefined;
};

PetCompanion.prototype.GetOwner = function()
{
	const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
	return cmpOwnership ? cmpOwnership.GetOwner() : INVALID_PLAYER;
};

PetCompanion.prototype.GetOwnerPosition = function()
{
	const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return undefined;

	return cmpPosition.GetPosition2D();
};

PetCompanion.prototype.GetPetPosition = function()
{
	const cmpPosition = Engine.QueryInterface(this.pet, IID_Position);
	if (!cmpPosition || !cmpPosition.IsInWorld())
		return undefined;

	return cmpPosition.GetPosition2D();
};

PetCompanion.prototype.IsPetAlive = function()
{
	return this.pet !== INVALID_ENTITY && !!Engine.QueryInterface(this.pet, IID_Position);
};

PetCompanion.prototype.DestroyPet = function()
{
	if (this.pet !== INVALID_ENTITY)
		Engine.DestroyEntity(this.pet);

	this.pet = INVALID_ENTITY;
	this.wanderTarget = undefined;
	this.commandTarget = undefined;
};

PetCompanion.prototype.UpdatePetOwner = function()
{
	if (!this.IsPetAlive())
		return;

	const cmpOwnership = Engine.QueryInterface(this.pet, IID_Ownership);
	if (cmpOwnership)
		cmpOwnership.SetOwner(this.GetOwner());
};

PetCompanion.prototype.SpawnPet = function()
{
	const owner = this.GetOwner();
	const ownerPosition = this.GetOwnerPosition();
	if (owner <= 0 || !ownerPosition)
		return INVALID_ENTITY;

	const pet = Engine.AddEntity(this.template.Template);
	if (!pet || pet == INVALID_ENTITY)
		return INVALID_ENTITY;

	this.pet = pet;

	const cmpPosition = Engine.QueryInterface(pet, IID_Position);
	if (cmpPosition)
		cmpPosition.JumpTo(ownerPosition.x + 1, ownerPosition.y + 1);

	const cmpOwnership = Engine.QueryInterface(pet, IID_Ownership);
	if (cmpOwnership)
		cmpOwnership.SetOwner(owner);

	const cmpSpawnedEntity = Engine.QueryInterface(pet, IID_SpawnedEntity);
	if (cmpSpawnedEntity)
		cmpSpawnedEntity.SetSpawner(this.entity);

	return pet;
};

PetCompanion.prototype.EnsurePet = function()
{
	if (this.IsPetAlive())
		return this.pet;

	return this.SpawnPet();
};

PetCompanion.prototype.ClampDirectedTarget = function(ownerPosition, position)
{
	const directedRange = this.GetDirectedRange();
	const dx = position.x - ownerPosition.x;
	const dy = position.y - ownerPosition.y;
	const length = Math.sqrt(dx * dx + dy * dy);
	if (length <= directedRange || length <= 0.001)
		return position;

	const scale = directedRange / length;
	return new Vector2D(ownerPosition.x + dx * scale, ownerPosition.y + dy * scale);
};

PetCompanion.prototype.CommandPetToPoint = function(position, data)
{
	const ownerPosition = this.GetOwnerPosition();
	if (!position || !ownerPosition)
		return false;

	const target = position.constructor == Vector2D ? position : new Vector2D(position.x, position.z !== undefined ? position.z : position.y);
	this.commandTarget = {
		"position": this.ClampDirectedTarget(ownerPosition, target)
	};
	this.wanderTarget = undefined;
	this.nextWanderUpdateTime = 0;
	this.StepPetBehavior();
	return true;
};

PetCompanion.prototype.ChoosePointAround = function(origin, minRange, maxRange)
{
	const angle = Math.random() * 2 * Math.PI;
	const radius = minRange + Math.random() * Math.max(0, maxRange - minRange);
	return new Vector2D(
		origin.x + Math.cos(angle) * radius,
		origin.y + Math.sin(angle) * radius
	);
};

PetCompanion.prototype.MovePetTo = function(position)
{
	const cmpUnitAI = Engine.QueryInterface(this.pet, IID_UnitAI);
	if (!cmpUnitAI || !cmpUnitAI.WalkToPointRange)
		return false;

	return cmpUnitAI.WalkToPointRange(position.x, position.y, 0, this.GetApproachRange(), false, false);
};

PetCompanion.prototype.FormatPoint = function(point)
{
	if (!point)
		return "none";

	return "(" + point.x.toFixed(2) + ", " + point.y.toFixed(2) + ")";
};

PetCompanion.prototype.GetBehaviorTarget = function(ownerPosition, petPosition, now)
{
	if (this.commandTarget &&
		ownerPosition.distanceTo(this.commandTarget.position) > this.GetDirectedRange())
		this.commandTarget = undefined;

	if (this.commandTarget)
		return this.commandTarget.position;

	if (petPosition.distanceTo(ownerPosition) > this.GetLeashRadius())
	{
		this.wanderTarget = this.ChoosePointAround(ownerPosition, 0, this.GetWanderMinRange());
		this.nextWanderUpdateTime = now + this.GetWanderInterval();
		return this.wanderTarget;
	}

	if (!this.wanderTarget ||
		now >= this.nextWanderUpdateTime ||
		petPosition.distanceTo(this.wanderTarget) <= this.GetApproachRange())
	{
		this.wanderTarget = this.ChoosePointAround(ownerPosition, this.GetWanderMinRange(), this.GetWanderMaxRange());
		this.nextWanderUpdateTime = now + this.GetWanderInterval();
	}

	return this.wanderTarget;
};

PetCompanion.prototype.StepPetBehavior = function()
{
	if (!this.EnsurePet())
		return;

	const ownerPosition = this.GetOwnerPosition();
	const petPosition = this.GetPetPosition();
	if (!ownerPosition || !petPosition)
		return;

	const target = this.GetBehaviorTarget(ownerPosition, petPosition, this.GetTime());
	if (target)
		this.MovePetTo(target);
};

PetCompanion.prototype.Tick = function(data, lateness)
{
	this.StepPetBehavior();
};

PetCompanion.prototype.GetPet = function()
{
	return this.EnsurePet();
};

PetCompanion.prototype.OnOwnershipChanged = function(msg)
{
	if (msg.to <= 0)
	{
		this.DestroyPet();
		return;
	}

	if (this.EnsurePet())
		this.UpdatePetOwner();
};

PetCompanion.prototype.OnDestroy = function()
{
	this.StopTimer();
	this.DestroyPet();
};

Engine.RegisterComponentType(IID_PetCompanion, "PetCompanion", PetCompanion);
