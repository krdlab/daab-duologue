// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Playbook } from "../src/Playbook";
import { trigger, input, reportAsText } from "../src/Playbook/Builder/V0";
import { serial } from "../src/Playbook/Builder/Utils";

export class DuologueData {
  text: string;
}
const dataGenerator = () => new DuologueData();
type Data = DuologueData;

export function playbook() {
  return new Playbook(dataGenerator, start());
}

function start() {
  return trigger<Data>(
    /echo/i,
    action()
  );
}

function action() {
  return serial(
    inputText,
    report,
  );
}

const inputText = input<Data>(
  "何か入力してください",
  (data, text) => { data.text = text; }
);

const report = reportAsText<Data>(data => `echo: ${data.text}`);