import { Deque } from "@datastructures-js/deque";
import { ImageObject } from "./types";

class CircularArray {
  private deque: Deque<ImageObject>;
  private MAX_IMAGES = 100; // can change later
  constructor() {
    this.deque = new Deque<ImageObject>();
  }

  insert(object: ImageObject): void {
    if (this.deque.size() >= 100) {
      this.deque.popFront();
    }
    this.deque.pushBack(object);
  }
}

const circularArray = new CircularArray();

export default circularArray;
