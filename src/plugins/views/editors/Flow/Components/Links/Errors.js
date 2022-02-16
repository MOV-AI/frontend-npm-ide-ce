export class InvalidLink extends Error {
  constructor(link) {
    const message = `Link ${link.id} is invalid`;
    super(message);
    this.link = link;
  }
}

export class MisMatchMessageLink extends Error {
  constructor(link, dataPort, fixError) {
    const sourceMessage = dataPort.source.data.message;
    const targetMessage = dataPort.target.data.message;
    const message = `Link has mismatch:\n${sourceMessage} => ${targetMessage}`;
    super(message);
    this.link = link;
    this.fixError = fixError;
  }
}
