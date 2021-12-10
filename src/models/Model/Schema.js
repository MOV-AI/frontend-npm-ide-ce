class Schema {
  constructor(schema) {
    this.schema = schema;
  }

  validate = data => this.schema.validate(data);
}

export default Schema;
