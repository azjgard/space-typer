interface IDrawImageArgs {
  context: CanvasRenderingContext2D;
  image: CanvasImageSource;
  x: number;
  y: number;
  width: number;
  height: number;
  deg?: number;
  flip?: boolean;
  flop?: boolean;
  center?: boolean;
  sheet?: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  };
}

export function drawImage(args: IDrawImageArgs) {
  let {
    context,
    image,
    x,
    y,
    width,
    height,
    deg = 0,
    flip = false,
    flop = false,
    center = false,
    sheet,
  } = args;

  context.save();

  if (typeof width === "undefined") width = image.width as number;
  if (typeof height === "undefined") height = image.height as number;
  if (typeof center === "undefined") center = false;

  // Set rotation point to center of image, instead of top/left
  if (center) {
    x -= width / 2;
    y -= height / 2;
  }

  // Set the origin to the center of the image
  context.translate(x + width / 2, y + height / 2);

  // Rotate the canvas around the origin
  const rad = 2 * Math.PI - (deg * Math.PI) / 180;
  context.rotate(rad);

  // Flip/flop the canvas
  let flipScale;
  if (flip) flipScale = -1;
  else flipScale = 1;

  let flopScale;
  if (flop) flopScale = -1;
  else flopScale = 1;
  context.scale(flipScale, flopScale);

  // coordinates on the canvas to draw the image
  const dx = -width / 2;
  const dy = -height / 2;
  const dWidth = width;
  const dHeight = height;

  if (sheet) {
    context.drawImage(
      image,
      sheet.sx,
      sheet.sy,
      sheet.sWidth,
      sheet.sHeight,
      dx,
      dy,
      dWidth,
      dHeight
    );
  } else {
    context.drawImage(image, dx, dy, dWidth, dHeight);
  }

  context.restore();
}

interface EntityToCheckCollisionFor {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function entitiesColliding(
  entity1: EntityToCheckCollisionFor,
  entity2: EntityToCheckCollisionFor
) {
  return (
    entity1.position.x <= entity2.position.x + entity2.size.width &&
    entity1.position.x + entity1.size.width >= entity2.position.x &&
    entity1.position.y <= entity2.position.y + entity2.size.height &&
    entity1.position.y + entity1.size.height >= entity2.position.y
  );
}