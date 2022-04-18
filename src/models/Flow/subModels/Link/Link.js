import Model from "../../../Model";
import schema from "./schema";

const SEPARATOR = {
  SUBFLOW: "__",
  NODE: "/"
};

class Link extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });

    //========================================================================================
    /*                                                                                      *
     *                                   Model Properties                                   *
     *                                                                                      */
    //========================================================================================

    this.from = "";
    this.to = "";
    this.dependency = 0;

    // Define observable properties
    this.observables = Object.values(Link.OBSERVABLE_KEYS);
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  getFrom() {
    return this.from;
  }

  setFrom(value) {
    this.from = value;
    return this;
  }

  getTo() {
    return this.to;
  }

  setTo(value) {
    this.to = value;
    return this;
  }

  getDependency() {
    return this.dependency;
  }

  setDependency(value) {
    this.dependency = value;
    return this;
  }

  getNodes() {
    return [this.getFrom(), this.getTo()].map(value => {
      return value.split(SEPARATOR.NODE)[0].split(SEPARATOR.SUBFLOW)[0];
    });
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  serialize() {
    return {
      id: this.getId(),
      from: this.getFrom(),
      to: this.getTo(),
      dependency: this.getDependency()
    };
  }

  serializeToDB() {
    const { from, to, dependency } = this.serialize();

    return {
      From: from,
      To: to,
      Dependency: dependency
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Static                                        *
   *                                                                                      */
  //========================================================================================

  static serializeOfDB(json) {
    const id = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const { From: from, To: to, Dependency: dependency } = content;

    return { id, from, to, dependency };
  }

  static OBSERVABLE_KEYS = {
    ID: "id",
    FROM: "from",
    TO: "to",
    DEPENDENCY: "dependency"
  };
}

export default Link;
