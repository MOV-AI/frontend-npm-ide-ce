import Model from "../../../Model/Model";
import schema from "./schema";

class PyLib extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================
  module = "";
  libClass = "";

  observables = ["name", "module", "libClass"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  getModule() {
    return this.module;
  }

  setModule(value) {
    this.module = value;
    return this;
  }
  getClass() {
    return this.libClass;
  }

  setClass(value) {
    this.libClass = value;
    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  serialize() {
    return {
      name: this.getName(),
      module: this.getModule(),
      libClass: this.getClass()
    };
  }

  serializeToDB() {
    const { module, libClass } = this.serialize();

    return {
      Module: module,
      Class: libClass
    };
  }

  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const { Module: module, Class: libClass } = content;

    return { name, module, libClass };
  }
}

export default PyLib;
