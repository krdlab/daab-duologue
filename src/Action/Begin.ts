// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Action, HasPattern, ActionFactory, AbstractResponse, ActionRespondType } from "./Types";

export class TriggerAction<D> implements Action<D>, HasPattern {
  readonly isEnd = false;
  constructor(
    readonly pattern: RegExp,
    private readonly next: ActionFactory<D>
  ) {}

  send(res: AbstractResponse): void {
    // nop
  }

  matches(type: ActionRespondType, res: AbstractResponse): boolean {
    return type === "text" && this.pattern.test(res.match[1]);
  }

  receive(res: AbstractResponse): Action<D> {
    return this.next();
  }
}