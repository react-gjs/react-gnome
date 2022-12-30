import path from "path";
import { generateUniqueName } from "./generate-unique-name";

class AppResource {
  private uid = generateUniqueName(8);

  constructor(private origin: string, private appName: string) {}

  get name() {
    return this.uid + "-" + path.basename(this.origin);
  }

  get fullPath() {
    return path.resolve(this.origin);
  }

  get resourceString() {
    return `resource:///org/gnome/${this.appName}/${this.name}`;
  }
}

export class AppResources {
  private resources = new Map<string, AppResource>();

  constructor(private appName: string) {}

  registerResource(origin: string) {
    if (this.resources.has(origin)) return this.resources.get(origin)!;

    const resource = new AppResource(origin, this.appName);
    this.resources.set(origin, resource);
    return resource;
  }

  getAll() {
    return [...this.resources.values()];
  }
}
