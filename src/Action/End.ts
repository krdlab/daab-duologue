// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Action, ActionFactory, AbstractResponse, ActionRespondType, StoreReader, AbstractEndAction } from "./Types";

export class ReportAsTextAction<D> extends AbstractEndAction<D> {
  constructor(private readonly format: (data: D) => string) {
    super();
  }
  send(res: AbstractResponse, reader: StoreReader<D>) {
    res.send(this.format(reader()));
  }
}

export class AbortAction<D> extends AbstractEndAction<D> {
  constructor(private readonly message: string) {
    super();
  }
  send(res: AbstractResponse) {
    res.send(this.message);
  }
}

export class NoAction extends AbstractEndAction<any> {
  send() {}
}