/* eslint new-cap: [2, {"capIsNewExceptions": ["Q"]}] */
const elasticio = require('elasticio-node');
const messages = elasticio.messages;
const edifact = require('edifact');
const request = require('request');

module.exports.process = processAction;


/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg) {
  console.log('Incoming message=%j', msg);
  let fileURL;
  const that = this;
  if (msg && msg.attachments && Object.keys(msg.attachments).length > 0) {
    var key = Object.keys(msg.attachments)[0];
    console.log('Found attachment key=%s attachment=%j', key, msg.attachments[key]);
    fileURL = msg.attachments[key].url;
  } else {
    console.error('URL of the EDI file is missing');
    this.emit('error', 'URL of the EDI file is missing');
    return this.emit('end');
  }

  const result = [];
  let elements;
  let components;

  const validator = new edifact.Validator();
  const parser = new edifact.Parser(validator);
  validator.define(require('edifact/segments.js'));
  validator.define(require('edifact/elements.js'));

  parser.on('opensegment', function (segment) {
    elements = [];
    result.push({name: segment, elements: elements});
  });

  parser.on('closesegment', function () {});

  parser.on('element', function () {
    components = [];
    elements.push(components);
  });

  parser.on('component', function (value) {
    components.push(value);
  });

  parser.encoding('UNOA');

  parser.on('end', function () {
    console.log('End!');
  });

  parser.on('error', err => this.emit('error', err));

  console.log('Sending GET request to url=%s', fileURL);
  let content = '';
  request.get(fileURL)
        .on('response', function (response) {
          console.log('Have got response status=%s headers=%j', response.statusCode, response.headers);
          if (response.statusCode !== 200) {
            that.emit('error', 'Unexpected response code code=' + response.statusCode);
            throw Error('Unexpected response code code=' + response.statusCode);
          }
        })
        .on('data', buffer => {
          content += buffer.toString();
        })
        .on('error', err => {
          that.emit('error', err);
          that.emit('end');
        })
        .on('end', () => {
          console.log('Parsing EDIFACT: %s', content);
          parser.write(content);
          parser.end();
          const body = {
            result: result
          };
          console.log('Parsing result: %j', body);
          that.emit('data', messages.newMessageWithBody(body));
          that.emit('end');
        });
}
