// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Action, ActionRespondType, AbstractResponse } from "./Action";
import { IStore, StoreKey, MemoryStore } from "./Store";

class RobotState<D> {
  action: Action<D>; // FIXME: An Action is NOT serializable
  data: D;
}

export class Session<D> {
  constructor(
    private readonly key: SessionKey,
    readonly isNewlyCreated: boolean,
    private readonly store: IStore<RobotState<D>>
  ) {}

  private get action(): Action<D> {
    return this.store.find(this.key.storeKey)!.action; // FIXME: ad hoc
  }

  private set action(a: Action<D>) {
    this.update(s => s.action = a);
  }

  private update(proc: (s: RobotState<D>) => void): void {
    this.store.update(this.key.storeKey, d => { proc(d); return d; });
  }

  begin(root: Action<D>, newData: D): void {
    this.update(s => {
      s.action = root;
      s.data = newData;
    });
  }

  isResponseTarget(type: ActionRespondType, res: AbstractResponse): boolean {
    return this.action.matches(type, res);
  }

  handleResponse(res: AbstractResponse): Action<D> | undefined {
    const updater = (proc: (a: D) => D) => this.update(s => proc(s.data));
    return this.action.receive(res, updater);
  }

  startNextAction(next: Action<D>, res: AbstractResponse): void {
    this.action = next;
    next.send(res, () => this.store.find(this.key.storeKey)!.data);
  }

  end(): void {
    this.store.remove(this.key.storeKey);
  }
}

export class SessionKey {
  private constructor(
    readonly userId: string,
    readonly talkId: string,
    readonly storeKey: StoreKey = new StoreKey(`${userId}-${talkId}`)
  ) {}

  static of(res: AbstractResponse) {
    return new SessionKey(res.message.user.id, res.message.room);
  }
}

export class SessionManager<D> {
  constructor(
    private readonly store: IStore<RobotState<D>> = new MemoryStore<RobotState<D>>() // FIXME
  ) {}

  beginSession(key: SessionKey) {
    return this._findOrCreateSession(key);
  }

  findSession(key: SessionKey): Session<D> | undefined {
    if (this.store.has(key.storeKey)) {
      return new Session(key, false, this.store);
    } else {
      return undefined;
    }
  }

  private _findOrCreateSession(key: SessionKey) {
    const s = this.findSession(key);
    if (s) {
      return s;
    }
    this.store.set(key.storeKey, new RobotState<D>());
    return new Session(key, true, this.store);
  }
}