// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import * as daab from "lisb-hubot";
import { Action, AbstractResponse, ActionRespondType } from "./Action";
import { Session, SessionKey, SessionManager } from "./Session";
import { Playbook } from "./Playbook";

export class Actor<D> {
  private readonly sessions: SessionManager<D>;

  constructor(private readonly robot: daab.Robot) {
    this.sessions = new SessionManager();
  }

  act(playbook: Playbook<D>): void {
    const msgs = playbook.eventMessages;
    if (msgs.enter) {
      this.setEnterMessage(msgs.enter);
    }
    if (msgs.leave) {
      this.setLeaveMessage(msgs.leave);
    }
    if (msgs.help) {
      this.setHelpMessage(msgs.help);
    }
    this.setRespondAll(playbook.root, playbook.dataGenerator);
  }

  private setEnterMessage(msg: string): void {
    this.robot.enter(res => res.send(msg));
  }
  private setLeaveMessage(msg: string): void {
    this.robot.leave(res => res.send(msg));
  }
  private setHelpMessage(msg: string): void {
    this.robot.respond(/(help|ヘルプ)/i, res => res.send(msg));
  }

  private setRespondAll(root: Action<D>, gen: () => D): void {
    const typedHandler = (type: ActionRespondType) => {
      return <Res extends AbstractResponse>(res: Res) => {
        if (!this.hasSession(res) && !root.matches(type, res)) {
          return;
        }
        const session = this.getSession(res);
        if (session.isNewlyCreated) {
          session.begin(root, gen());
        }
        if (!session.isResponseTarget(type, res)) {
          return;
        }
        const next = session.handleResponse(res);
        if (next) {
          session.startNextAction(next, res);
          if (next.isEnd) {
            session.end();
          }
        } else {
          session.end();
        }
      };
    }
    this.robot.respond(/(.*)/, typedHandler("text"));
    this.robot.respond("yesno", typedHandler("yesno"));
    this.robot.respond("select", typedHandler("select"));
  }

  private hasSession(res: AbstractResponse): boolean {
    return this.sessions.findSession(SessionKey.of(res)) !== undefined;
  }

  private getSession(res: AbstractResponse): Session<D> {
    const key = SessionKey.of(res);
    const s = this.sessions.findSession(key);
    if (s) {
      return s;
    } else {
      return this.sessions.beginSession(key);
    }
  }
}