[![CircleCI](https://circleci.com/gh/elasticio/edifact-parser-component.svg?style=svg)](https://circleci.com/gh/elasticio/edifact-parser-component)
# edifact-parser-component 
## Table of Contents
* [General information](#general-information)
   * [Description](#description)
* [Credentials](#credentials)
* [Triggers](#triggers)
* [Actions](#actions)
   * [Action Name](#parse)
* [License](#license)

## General information
### Description
EDIFACT Parser component for the [elastic.io platform](http://www.elastic.io). It reads incoming attachments and parses them using EDI parser.

## Credentials
This component requires no authentication.

## Actions
### Parse
EDIFACT Parse action expects an incoming message(es) with EDI attachment(s) in it.

Sample EDI file you can find [here](https://raw.githubusercontent.com/elasticio/edifact-parser-component/master/samples/INVOICE.edi), and [here](https://github.com/elasticio/edifact-parser-component/blob/master/samples/INVOICE.edi.json) you will see resulting JSON message body after parsing.

## Triggers
No triggers yet


## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)


[npm-image]: https://badge.fury.io/js/edifact-parser-component.svg
[npm-url]: https://npmjs.org/package/edifact-parser-component
[travis-image]: https://travis-ci.org/elasticio/edifact-parser-component.svg?branch=master
[travis-url]: https://travis-ci.org/elasticio/edifact-parser-component
[daviddm-image]: https://david-dm.org/elasticio/edifact-parser-component.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elasticio/edifact-parser-component
