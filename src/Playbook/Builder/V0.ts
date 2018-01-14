// Copyright (c) 2018 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { TriggerAction, TextAction, SelectAction, SelectOption, ReportAsTextAction, AbortAction, ActionFactory } from "../../Action";
import { Playbook } from "../../Playbook";

export function trigger<D>(pattern: RegExp, next: ActionFactory<D>) {
  return new TriggerAction(pattern, next);
}

type SaveSelected<D> = (data: D, index: number, option: SelectOption<D>) => void;

export function selectOptions<D>(question: string, options: Array<SelectOption<D>>, save: SaveSelected<D>): ActionFactory<D> {
  return () => new SelectAction<D>(
    question,
    (updator, {index, option}) => updator(d => { save(d, index, option); return d; }),
    options
  );
}

export function option<D>(text: string, next: ActionFactory<D>) {
  return new SelectOption(text, next);
}

export function selectTexts<D>(question: string, texts: Array<string>, save: SaveSelected<D>): (next: ActionFactory<D>) => ActionFactory<D> {
  return (next: ActionFactory<D>) => {
    const options = texts.map(t => new SelectOption(t, next));
    return selectOptions<D>(question, options, save);
  }
}

type SaveText<D> = (data: D, text: string) => void;

export function input<D>(message: string, save: SaveText<D>): (next: ActionFactory<D>) => ActionFactory<D> {
  return (next: ActionFactory<D>) =>
    () => new TextAction<D>(
      message,
      (updator, {text}) => updator(d => { save(d, text); return d; }),
      next
    );
}

export function reportAsText<D>(formatter: (d: D) => string): (next: ActionFactory<D>) => ActionFactory<D> {
  return (_: ActionFactory<D>) =>
    () => new ReportAsTextAction(formatter);
}

export function abort<D>(message: string): ActionFactory<D> {
  return () => new AbortAction<D>(message);
}