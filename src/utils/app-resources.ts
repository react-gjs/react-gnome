import path from "path";
import { appIDToPath } from "./app-id-to-path";
import { generateUniqueName } from "./generate-unique-name";

class AppResource {
  private uid = generateUniqueName(8);

  constructor(private origin: string, private appID: string) {}

  get name() {
    return this.uid + "-" + path.basename(this.origin);
  }

  get fullPath() {
    return path.resolve(this.origin);
  }

  get resourceString() {
    return `resource:///${appIDToPath(this.appID)}/${this.name}`;
  }
}

export class AppResources {
  private resources = new Map<string, AppResource>();

  constructor(private appID: string) {}

  registerResource(origin: string) {
    if (this.resources.has(origin)) return this.resources.get(origin)!;

    const resource = new AppResource(origin, this.appID);
    this.resources.set(origin, resource);
    return resource;
  }

  getAll() {
    return [...this.resources.values()];
  }
}
