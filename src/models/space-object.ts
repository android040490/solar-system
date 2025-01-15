import { ViewableObject } from "./navigation";

export interface SpaceObject extends ViewableObject {
  name: string;
  update: () => void;
}
