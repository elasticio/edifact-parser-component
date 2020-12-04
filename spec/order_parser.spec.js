const { assert } = require('chai');
const Parser = require('edifact/parser.js');
const Validator = require('edifact/validator.js');

const orderEdi = `UNH+SSDD1+ORDERS:D:03B:UN:EAN008'
BGM+220+BKOD99+9'
DTM+137:20051107:102'
NAD+BY+5412345000176::9'
NAD+SU+4012345000094::9'
LIN+1+1+0764569104:IB'
QTY+1:25'
FTX+AFM+1++XPath 2.0 Programmer?'s Reference'
LIN+2+1+0764569090:IB'
QTY+1:25'
FTX+AFM+1++XSLT 2.0 Programmer?'s Reference'
LIN+3+1+1861004656:IB'
QTY+1:16'
FTX+AFM+1++Java Server Programming'
LIN+4+1+0596006756:IB'
QTY+1:10'
FTX+AFM+1++Enterprise Service Bus'
UNS+S'
CNT+2:4'
UNT+22+SSDD1'`;

describe('Order Parsing', () => {
  describe('Parser', () => {
    it('should be able to parse edi', () => {
      const validator = new Validator();
      const parser = new Parser(validator);

      // Provide some segment and element definitions.
      // eslint-disable-next-line global-require
      validator.define(require('edifact/segments.js'));
      // eslint-disable-next-line global-require
      validator.define(require('edifact/elements.js'));

      // Parsed segments will be collected in the result array.
      const result = [];
      let elements;
      let components;

      parser.on('opensegment', (segment) => {
        // Started a new segment.
        elements = [];
        result.push({ name: segment, elements });
      });

      parser.on('element', () => {
        // Parsed a new element.
        components = [];
        elements.push(components);
      });

      parser.on('component', (value) => {
        // Got a new component.
        components.push(value);
      });

      parser.on('closesegment', () => {
        // Closed a segment.
      });
      parser.encoding('UNOB');
      parser.write(orderEdi);
      parser.end();
      assert.equal(20, result.length);
      assert.equal('{"name":"NAD","elements":[["SU"],["4012345000094","","9"]]}', JSON.stringify(result[4]));
    });
  });
});
