// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Brain } from "lisb-hubot";

export class StoreKey {
  constructor(private readonly key: string) {}
}

export interface IStore<V> {
  set({ key }: StoreKey, value: V): void;
  has({ key }: StoreKey): boolean;
  find({ key }: StoreKey): V | undefined;
  update({ key }: StoreKey, proc: (value: V) => V): void;
  remove({ key }: StoreKey): void;
}

export class MemoryStore<V> implements IStore<V> {
  private readonly map = new Map<string, V>();

  set({ key }: StoreKey, value: V): void {
    this.map.set(key, value);
  }

  has({ key }: StoreKey): boolean {
    return this.map.has(key);
  }

  find({ key }: StoreKey) {
    return this.map.get(key);
  }

  update({ key }: StoreKey, proc: (value: V) => V): void {
    const v = this.map.get(key);
    if (v) {
      this.map.set(key, proc(v));
    }
  }

  remove({ key }: StoreKey): void {
    this.map.delete(key);
  }
}

export class HubotBrainStore<V> implements IStore<V> /* FIXME: V is serializable */ {
  constructor(private readonly brain: Brain) {}

  set({ key }: StoreKey, value: V): void {
    this.brain.set(key, value);
  }

  has({ key }: StoreKey): boolean {
    return this.brain.get(key) !== undefined;
  }

  find({ key }: StoreKey): V | undefined {
    return this.brain.get(key);
  }

  update({ key }: StoreKey, proc: (value: V) => V): void {
    const v = this.brain.get(key);
    if (v) {
      this.brain.set(key, proc(v));
    }
  }

  remove({ key }: StoreKey): void {
    this.brain.remove(key);
  }
}