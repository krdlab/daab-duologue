// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Playbook } from "../src/Playbook";
import { trigger, selectOptions, selectTexts, option, input, reportAsText, abort } from "../src/Playbook/Builder/V0";
import { serial } from "../src/Playbook/Builder/Utils";

export class DuologueData {
  clientType: string = "";
  os: string = "";
  osVersion: string = "";
  appVersion?: string = undefined;
  browser?: string = undefined;
  description: string = "";
}
const dataGenerator = () => new DuologueData();
type Data = DuologueData;

const ENTER_MESSAGE = `この Bot は不具合報告をサポートします．
"不具合報告" と入力すると始まります．`;

export function playbook() {
  return new Playbook(dataGenerator, start())
    .whenEnterEvent(ENTER_MESSAGE)
    .whenHelpEvent(ENTER_MESSAGE);
}

function start() {
  return trigger<Data>(
    /不具合報告/i,
    selectOptions(
      "クライアントを選択してください",
      [
        option("iOS 版", actionIos()),
        option("Android 版", actionAndroid()),
        option("Web 版", actionWeb()),
        option("デスクトップ版", actionDesktop()),
      ],
      (data, index, option) => { data.clientType = option.text; }
    )
  );
}

function actionIos() {
  return serial(
    inputOsVersion("iOS"),
    inputAppVersion,
    describe,
    report,
  );
}
function actionAndroid() {
  return serial(
    inputOsVersion("Android"),
    inputAppVersion,
    describe,
    report,
  );
}
function actionWeb() {
  return selectOptions<Data>(
    "OS を選択してください",
    [
      optionWebWindows(),
      optionWebMac(),
      optionUnknownOS()
    ],
    (data, index, option) => { data.os = option.text; }
  );
}
function actionDesktop() {
  return selectOptions<Data>(
    "OS を選択してください",
    [
      optionDesktopWindows(),
      optionDesktopMac(),
      optionUnknownOS()
    ],
    (data, index, option) => { data.os = option.text; }
  );
}

function optionWebWindows() {
  return option<Data>(
    "Windows",
    serial(
      inputOsVersion("Windows"),
      selectBrowserOnWindows,
      describe,
      report,
    )
  );
}
function optionWebMac() {
  return option<Data>(
    "Mac",
    serial(
      inputOsVersion("Mac"),
      selectBrowserOnMac,
      describe,
      report,
    )
  );
}
function optionUnknownOS() {
  return option<Data>(
    "その他",
    abort("未実装")
  );
}

function optionDesktopWindows() {
  return option<Data>(
    "Windows",
    serial(
      inputOsVersion("Windows"),
      inputAppVersion,
      describe,
      report,
    )
  );
}
function optionDesktopMac() {
  return option<Data>(
    "Mac",
    serial(
      inputOsVersion("Mac"),
      inputAppVersion,
      describe,
      report,
    )
  );
}

const selectBrowserOnWindows = selectTexts<Data>(
  "ブラウザを選択してください",
  ["IE11", "Edge", "Chrome", "Firefox", "その他"],
  (data, index, option) => { data.browser = option.text; }
);

const selectBrowserOnMac = selectTexts<Data>(
  "ブラウザを選択してください",
  ["Safari", "Chrome", "Firefox", "その他"],
  (data, index, option) => { data.browser = option.text; }
);

const inputOsVersion = (os: string) => input<Data>(
  `${os} のバージョンを入力してください`,
  (data, text) => { data.osVersion = text; },
);

const inputAppVersion = input<Data>(
  "アプリのバージョンを入力してください",
  (data, text) => { data.appVersion = text; }
);

const describe = input<Data>(
  "詳細を入力してください",
  (data, text) => { data.description = text; }
);

const report = reportAsText<Data>(data => (
`[クライアント]
${data.clientType}

[OS]
${data.os}, ${data.osVersion}

[アプリのバージョン]
${data.appVersion}

[ブラウザ]
${data.browser}

[詳細]
${data.description}

(※ このメッセージを報告先のトークに転送してください)`)
);