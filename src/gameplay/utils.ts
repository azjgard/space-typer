import Entity from "./entities/entity";

export function absoluteClamp(value: number, clamp: number) {
  const c = Math.abs(clamp);
  if (value < 0) {
    return Math.max(c * -1, value);
  } else {
    return Math.min(c, value);
  }
}

export function entitiesColliding(entity1: Entity, entity2: Entity) {
  return (
    entity1.position.x <= entity2.position.x + entity2.size.width &&
    entity1.position.x + entity1.size.width >= entity2.position.x &&
    entity1.position.y <= entity2.position.y + entity2.size.height &&
    entity1.position.y + entity1.size.height >= entity2.position.y
  );
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];
