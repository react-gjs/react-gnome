type Resource = `resource:///${string}`;

declare module "*.jpg" {
  const resource: Resource;
  export default resource;
}

declare module "*.jpeg" {
  const resource: Resource;
  export default resource;
}

declare module "*.png" {
  const resource: Resource;
  export default resource;
}

declare module "*.webp" {
  const resource: Resource;
  export default resource;
}

declare module "*.svg" {
  const resource: Resource;
  export default resource;
}

declare module "*.webm" {
  const resource: Resource;
  export default resource;
}

declare module "*.mpeg" {
  const resource: Resource;
  export default resource;
}

declare module "*.mp4" {
  const resource: Resource;
  export default resource;
}

declare module "*.css" {
  const resource: Resource;
  export default resource;
}

declare module "*.ui" {
  const resource: Resource;
  export default resource;
}
