import {
  Sentences,
  CustomEntities,
  SelectedCustomEntities,
  Entities,
  SelectedEntities,
  Tokens,
  SelectedTokens,
  ItemCustomEntity,
  ItemEntity,
  ItemSentence,
  ItemToken,
  Document,
  ItsFunction,
  AsFunction,
} from 'wink-nlp';

export type ColOutApplicable = Sentences | CustomEntities | SelectedCustomEntities | Entities | SelectedEntities | Tokens | SelectedTokens;

// collection out
// $ExpectType <T, U>(toOut: ColOutApplicable, itsf: ItsFunction<T>, asf: AsFunction<T, U>) => U
export function myColOut<T, U>(toOut: ColOutApplicable, itsf: ItsFunction<T>, asf: AsFunction<T, U>): U {
  return (toOut.out(itsf, asf) as any) as U;
}

// run out on item types
export type ItemOutApplicable = ItemCustomEntity | ItemEntity | ItemSentence | ItemToken | Document;

// item out
// $ExpectType <T>(toOut: ItemOutApplicable, itsf: ItsFunction<T>) => T
export function myItemOut<T>(toOut: ItemOutApplicable, itsf: ItsFunction<T>): T {
  return (toOut.out(itsf) as any) as T;
}
