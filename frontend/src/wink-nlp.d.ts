declare module 'wink-nlp' {
  import { ModelAddons } from 'wink-eng-lite-web-model';

  type WinkMethods = {
    readDoc(text: string): Document,
    // returns number of learned entities
    learnCustomEntities(examples: CustomEntityExample[], config?: CerConfig): number,
    its: ItsHelpers,
    as: AsHelpers,
  }

  declare let WinkFn: (theModel: Model, pipe?: string[]) => WinkMethods;
  export default WinkFn;


  export type ItsFunction<OutType> = (index: number, token: Token, cache?: Cache, addons?: ModelAddons) => OutType;
  export type AsFunction<InType, OutType> = (tokens: InType[]) => OutType;

  export type ItemToken = {
    parentDocument(): Document,
    parentEntity(): ItemEntity,
    parentCustomEntity(): ItemCustomEntity,
    markup(beginMarker: string, endMarker: string): void,
    out<T>(itsf: ItsFunction<T>): T,
    parentSentence(): ItemSentence,
    index(): number
  }

  export type SelectedTokens = {
    each(f: (token: ItemToken) => void): void,
    filter(f: (token: ItemToken) => boolean): SelectedTokens,
    itemAt(k: number): ItemToken | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type Tokens = {
    each(f: (token: ItemToken) => void): void,
    filter(f: (token: ItemToken) => boolean): SelectedTokens,
    itemAt(k: number): ItemToken | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type ItemEntity = {
    parentDocument(): Document,
    markup(beginMarker: string, endMarker: string): void,
    out<T>(itsf: ItsFunction<T>): T,
    parentSentence(): ItemSentence,
    tokens(): Tokens,
    index(): number
  }

  export type SelectedEntities = {
    each(f: (entity: ItemEntity) => void): void,
    filter(f: (entity: ItemEntity) => boolean): SelectedEntities,
    itemAt(k: number): ItemEntity | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type Entities = {
    each(f: (entity: ItemEntity) => void): void,
    filter(f: (entity: ItemEntity) => boolean): SelectedEntities,
    itemAt(k: number): ItemEntity | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type ItemCustomEntity = {
    parentDocument(): Document,
    markup(beginMarker: string, endMarker: string): void,
    out<T>(itsf: ItsFunction<T>): T,
    parentSentence(): ItemSentence,
    tokens(): Tokens,
    index(): number
  }

  export type SelectedCustomEntities = {
    each(f: (entity: ItemCustomEntity) => void): void,
    filter(f: (entity: ItemCustomEntity) => boolean): SelectedCustomEntities,
    itemAt(k: number): ItemCustomEntity | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type CustomEntities = {
    each(f: (entity: ItemCustomEntity) => void): void,
    filter(f: (entity: ItemCustomEntity) => boolean): SelectedCustomEntities,
    itemAt(k: number): ItemCustomEntity | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type ItemSentence = {
    parentDocument(): Document,
    markup(beginMarker: string, endMarker: string): void,
    out<T>(itsf: ItsFunction<T>): T,
    entities(): Entities,
    customEntities(): CustomEntities,
    tokens(): Tokens,
    index(): number
  }

  export type Sentences = {
    each(f: (entity: ItemSentence) => void): void,
    itemAt(k: number): ItemSentence | undefined,
    length(): number,
    out<T, U>(itsf: ItsFunction<T>, asf: AsFunction<T, U>): U
  }

  export type Document = {
    entities(): Entities,
    customEntities(): CustomEntities,
    isLexeme(text: string): boolean,
    isOOV(text: string): boolean,
    out<T>(itsf: ItsFunction<T>): T,
    sentences(): Sentences,
    tokens(): Tokens,
    printTokens(): void
  }

  export type CerExample = {
    name: string,
    patterns: string[]
  }

  export type CerConfig = {
    matchValue?: boolean,
    usePOS?: boolean,
    useEntity?: boolean
  }

  // its helpers

  export type Case =
    "other" |
    "lowerCase" |
    "upperCase" |
    "titleCase";

  export type PartOfSpeech =
    "ADJ" |
    "ADP" |
    "ADV" |
    "AUX" |
    "CCONJ" |
    "DET" |
    "INTJ" |
    "NOUN" |
    "NUM" |
    "PART" |
    "PRON" |
    "PROPN" |
    "PUNCT" |
    "SCONJ" |
    "SYM" |
    "VERB" |
    "X" |
    "SPACE";

  // Its
  export type ItsHelpers = {
    case(index: number, token: Token, cache: Cache): Case;
    uniqueId(index: number, token: Token): number;
    negationFlag(index: number, token: Token): boolean;
    normal(index: number, token: Token, cache: Cache): string;
    contractionFlag(index: number, token: Token): boolean;
    pos(index: number, token: Token, cache: Cache): PartOfSpeech;
    precedingSpaces(index: number, token: Token): string;
    prefix(index: number, token: Token, cache: Cache): string;
    shape(index: number, token: Token, cache: Cache): string;
    stopWordFlag(index: number, token: Token, cache: Cache): boolean;
    abbrevFlag(index: number, token: Token, cache: Cache): boolean;
    suffix(index: number, token: Token, cache: Cache): string;
    type(index: number, token: Token, cache: Cache): string;
    value(index: number, token: Token, cache: Cache): string;
    stem(index: number, token: Token, cache: Cache, addons: ModelAddons): string;
    lemma(index: number, token: Token, cache: Cache, addons: ModelAddons): string;
    detail(): boolean; // TODO what is the return type
    markedUpText(index: number, token: Token, cache: Cache): string;
    span(spanItem): number[];
    sentiment(spanItem): number;
  };

  // As
  export type AsHelpers = {
    array<T>(tokens: T[]): T[];
    set<T>(tokens: T[]): Set<T>;
    bow<T>(tokens: T[]): { [T]: number };
    freqTable<T>(tokens: T[]): [token: T, freq: number][];
    bigrams<T>(tokens: T[]): [T, T][];
    unique<T>(tokens: T[]): T[];
    markedUpText<T>(tokens: T[]): string;
  }
}
