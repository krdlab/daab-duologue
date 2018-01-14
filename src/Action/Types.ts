// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import * as daab from "lisb-hubot";
import { IStore } from "../Store";

export type StoreReader<D> = () => D;
export type DataReader<D> = StoreReader<D>;

export type StoreUpdator<D> = (f: (d: D) => D) => void;
export type DataWriter<D, P> = (updator: StoreUpdator<D>, partial: P) => void;

export type ActionRespondType = daab.RespondType | "text";
export type AbstractResponse = daab.Response<daab.TextMessage>;

export type ActionFactory<D> = () => Action<D>;

export interface Action<D> {
  readonly isEnd: boolean;

  send(res: AbstractResponse, reader: StoreReader<D>): void;
  matches(type: ActionRespondType, res: AbstractResponse): boolean;
  receive(res: AbstractResponse, updator: StoreUpdator<D>): Action<D> | undefined; // return a next action
}

export interface HasPattern {
  pattern: RegExp;
}

export abstract class AbstractEndAction<D> implements Action<D> {
  readonly isEnd = true;

  abstract send(res: AbstractResponse, reader: StoreReader<D>): void;

  matches(type: ActionRespondType, res: AbstractResponse) {
    return true;
  }
  receive(res: AbstractResponse, updator: StoreUpdator<D>) {
    return undefined;
  }
}