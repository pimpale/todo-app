declare module 'wink-eng-lite-web-model' {
  export type ModelAddons = {
      // TODO
  }

  type Model = {
    core: unknown,
    addons: ModelAddons
  };

  declare const model: Model;
  export default model;
}
