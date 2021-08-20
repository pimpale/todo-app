import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
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



export const INT_MAX: number = 999999999999999;

export const setHrMin = (d: Date, hr: number, min: number) => setMinutes(setHours(d, hr), min)
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
