// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Action, ActionFactory, AbstractResponse, ActionRespondType, DataWriter, StoreUpdator } from "./Types";
import { IStore } from "../Store";
import * as daab from "lisb-hubot";

export class TextAction<D> implements Action<D> {
  readonly isEnd = false;
  constructor(
    readonly message: string,
    readonly write: DataWriter<D, {text: string}>,
    readonly next: ActionFactory<D>
  ) {}

  send(res: AbstractResponse) {
    res.send(this.message);
  }

  matches(type: ActionRespondType, res: AbstractResponse) {
    return type === "text";
  }

  receive(res: daab.Response<daab.TextMessage>, updator: StoreUpdator<D>) {
    const text = res.match[1];
    this.write(updator, {text});
    return this.next();
  }
}

export class SelectAction<D> implements Action<D> {
  readonly isEnd = false;
  constructor(
    readonly question: string,
    readonly write: DataWriter<D, {index: number, option: SelectOption<D>}>,
    readonly options: Array<SelectOption<D>>
  ) {}

  send(res: AbstractResponse) {
    res.send({question: this.question, options: this.options.map(o => (o.text))});
  }

  matches(type: ActionRespondType, res: AbstractResponse) {
    return type === "select";
  }

  receive(res: daab.ResponseWithJson<daab.SelectWithResponse>, updator: StoreUpdator<D>) {
    const index  = res.json.response!;  // FIXME
    const option = this.options[index]; // TODO: should check an index
    this.write(updator, {index, option});
    return option.createAction();
  }
}

export class SelectOption<D> {
  constructor(readonly text: string, readonly next: ActionFactory<D>) {}

  createAction() {
    return this.next();
  }
}