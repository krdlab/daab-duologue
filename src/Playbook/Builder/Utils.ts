// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { ActionFactory, NoAction } from "../../Action";

export function serial<D>(...nexts: Array<(next: ActionFactory<D>) => ActionFactory<D>>): ActionFactory<D> {
  if (nexts.length === 1) {
    return nexts[0](() => new NoAction());
  }
  const [x, ...xs] = nexts;
  return x(serial(...xs));
}

export const _undefined = (_: any) => undefined; // NOTE: this function for design