// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { TriggerAction } from "../Action";

type EventMessages = {
  enter?: string;
  leave?: string;
  help?:  string;
}

export class Playbook<D> {
  readonly eventMessages: EventMessages = {};

  constructor(readonly dataGenerator: () => D, readonly root: TriggerAction<D>) {}

  whenEnterEvent(message: string) {
    this.eventMessages.enter = message;
    return this;
  }
  whenLeaveEvent(message: string) {
    this.eventMessages.leave = message;
    return this;
  }
  whenHelpEvent(content: {toString: () => string}) {
    this.eventMessages.help = content.toString();
    return this;
  }
}