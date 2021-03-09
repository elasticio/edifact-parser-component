/* eslint new-cap: [2, {"capIsNewExceptions": ["Q"]}] */
const elasticio = require('elasticio-node');

const { messages } = elasticio;
const edifact = require('edifact');
const request = require('request');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 */
// eslint-disable-next-line consistent-return
async function processAction(msg) {
  const self = this;
  this.logger.info('Starting parse action...');
  let fileURL;
  const that = this;
  if (msg && msg.attachments && Object.keys(msg.attachments).length > 0) {
    const key = Object.keys(msg.attachments)[0];
    this.logger.info('Attachment found');
    fileURL = msg.attachments[key].url;
  } else {
    this.logger.error('URL of the EDI file is missing');
    this.emit('error', 'URL of the EDI file is missing');
    return;
  }

  const result = [];
  let elements;
  let components;

  const validator = new edifact.Validator();
  const parser = new edifact.Parser(validator);
  // eslint-disable-next-line global-require
  validator.define(require('edifact/segments.js'));
  // eslint-disable-next-line global-require
  validator.define(require('edifact/elements.js'));

  parser.on('opensegment', (segment) => {
    elements = [];
    result.push({ name: segment, elements });
  });

  parser.on('closesegment', () => {});

  parser.on('element', () => {
    components = [];
    elements.push(components);
  });

  parser.on('component', (value) => {
    components.push(value);
  });

  parser.encoding('UNOA');

  parser.on('end', () => {
    this.logger.trace('Parser: \'end\'');
  });

  parser.on('error', err => this.emit('error', err));

  this.logger.info('Sending GET request to provided url');
  let content = '';
  request.get(fileURL)
    .on('response', (response) => {
      self.logger.info('Have got response status=%s', response.statusCode);
      if (response.statusCode !== 200) {
        that.emit('error', `Unexpected response code code=${response.statusCode}`);
        throw Error(`Unexpected response code code=${response.statusCode}`);
      }
    })
    .on('data', (buffer) => {
      content += buffer.toString();
    })
    .on('error', (err) => {
      that.emit('error', err);
      that.emit('end');
    })
    .on('end', async () => {
      self.logger.info('Parsing EDIFACT...');
      parser.write(content);
      parser.end();
      const body = {
        result,
      };
      self.logger.info('Parsing completed');
      await that.emit('data', messages.newMessageWithBody(body));
      that.emit('end');
    });
}

module.exports.process = processAction;
