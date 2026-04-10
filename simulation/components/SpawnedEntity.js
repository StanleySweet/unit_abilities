function SpawnedEntity() {}

SpawnedEntity.prototype.Schema = "<empty/>";

SpawnedEntity.prototype.Init = function()
{
	this.spawner = INVALID_ENTITY;
};

SpawnedEntity.prototype.SetSpawner = function(entity)
{
	this.spawner = entity;
};

SpawnedEntity.prototype.GetSpawner = function()
{
	return this.spawner;
};

Engine.RegisterComponentType(IID_SpawnedEntity, "SpawnedEntity", SpawnedEntity);
