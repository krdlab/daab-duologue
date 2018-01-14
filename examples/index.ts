// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Robot } from "lisb-hubot";
import { Actor } from "../src/Actor";

import { DuologueData, playbook } from "./report-issue";
//import { DuologueData, playbook } from "./echo";

export = (robot: Robot) => new Actor<DuologueData>(robot).act(playbook());