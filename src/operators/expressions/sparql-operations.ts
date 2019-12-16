/* file : sparql-operations.ts
MIT License

Copyright (c) 2018-2020 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

import { Literal, Term, IRI } from '../../rdf/rdf-model'
import { BooleanLiteral, BufferLiteral, NumericLiteral, StringLiteral, DateLiteral } from '../../rdf/literals'
import { rdf } from '../../utils'
import * as uuid from 'uuid/v4'
import { isNull } from 'lodash'
import * as crypto from 'crypto'

/**
 * Return a high-orde which apply a Hash function to a RDF Term
 * and returns the corresponding RDF Literal
 * @param  {string} hashType - Type of hash (md5, sha256, etc)
 * @return {function} A function that hashes RDF term
 */
function applyHash (hashType: string): (v: Term) => Term {
  return v => {
    const hash = crypto.createHash(hashType)
    hash.update(v.toJS())
    return new BufferLiteral(hash.digest('hex'), 'hex', new IRI(rdf.XSD('hexBinary')))
  }
}

/**
 * Implementation of SPARQL operations found in FILTERS
 * All arguments are pre-compiled from string to an intermediate representation.
 * All possible intermediate representation are gathered in the `src/rdf-terms.js` file,
 * and are used to represents RDF Terms.
 * Each SPARQL operation is also expected to return the same kind of intermediate representation.
 * @author Thomas Minier
 * @author Corentin Marionneau
 */
export default {
  /*
    XQuery & XPath functions https://www.w3.org/TR/sparql11-query/#OperatorMapping
  */
  '+': function (a: Term, b: Term): Term {
    if (a.isLiteral() && b.isLiteral()) {
      return (a as Literal).add(b as Literal)
    }
    return new StringLiteral(`${a.toJS() + b.toJS()}`, null, null)
  },

  '-': function (a: Term, b: Term): Term {
    if (a.isLiteral() && b.isLiteral()) {
      return (a as Literal).minus(b as Literal)
    }
    return new StringLiteral(`${a.toJS() - b.toJS()}`, null, null)
  },

  '*': function (a: Term, b: Term): Term {
    if (a.isLiteral() && b.isLiteral()) {
      return (a as Literal).multiply(b as Literal)
    }
    return new StringLiteral(`${a.toJS() * b.toJS()}`, null, null)
  },

  '/': function (a: Term, b: Term): Term {
    if (a.isLiteral() && b.isLiteral()) {
      return (a as Literal).multiply(b as Literal)
    }
    return new StringLiteral(`${a.toJS() / b.toJS()}`, null, null)
  },

  '=': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(a.equals(b))
  },

  '!=': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(!a.equals(b))
  },

  '<': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(a.compareTo(b) < 0)
  },

  '<=': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(a.compareTo(b) <= 0)
  },

  '>': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(a.compareTo(b) > 0)
  },

  '>=': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(a.compareTo(b) >= 0)
  },

  '!': function (a: Term): Term {
    if (a instanceof BooleanLiteral) {
      return BooleanLiteral.fromBoolean(!a.toJS())
    }
    return BooleanLiteral.fromFalse()
  },

  '&&': function (a: Term, b: Term): Term {
    if (a instanceof BooleanLiteral && b instanceof BooleanLiteral) {
      return BooleanLiteral.fromBoolean(a.toJS() && b.toJS())
    }
    return BooleanLiteral.fromFalse()
  },

  '||': function (a: Term, b: Term): Term {
    if (a instanceof BooleanLiteral && b instanceof BooleanLiteral) {
      return new BooleanLiteral(`${a.toJS() || b.toJS()}`)
    }
    return BooleanLiteral.fromFalse()
  },

  /*
    SPARQL Functional forms https://www.w3.org/TR/sparql11-query/#func-forms
  */
  'bound': function (a: Term): Term {
    return BooleanLiteral.fromBoolean(!isNull(a))
  },

  'sameterm': function (a: Term, b: Term): Term {
    return BooleanLiteral.fromBoolean(a.equals(b))
  },

  'in': function (a: Term, b: Term[]): Term {
    return BooleanLiteral.fromBoolean(b.some(elt => a.equals(elt)))
  },

  'notin': function (a: Term, b: Term[]): Term {
    return BooleanLiteral.fromBoolean(!b.some(elt => a.equals(elt)))
  },

  /*
    Functions on RDF Terms https://www.w3.org/TR/sparql11-query/#func-rdfTerms
  */

  'isiri': function (a: Term): Term {
    return BooleanLiteral.fromBoolean(a.isIRI())
  },

  'isblank': function (a: Term): Term {
    return BooleanLiteral.fromBoolean(a.isVariable())
  },

  'isliteral': function (a: Term): Term {
    return BooleanLiteral.fromBoolean(a.isLiteral())
  },

  'isnumeric': function (a: Term): Term {
    return BooleanLiteral.fromBoolean(a.isLiteral() && a instanceof NumericLiteral)
  },

  'str': function (a: Term): Term {
    if (a.isLiteral() && a instanceof StringLiteral) {
      return a
    }
    return new StringLiteral(`${a.toJS()}`, null, null)
  },

  'lang': function (a: Term): Term {
    if (a.isLiteral() && a instanceof Literal && a.hasLang()) {
      return new StringLiteral(a.getLang()!, null, null)
    }
    return StringLiteral.empty()
  },

  'datatype': function (a: Term): Term {
    if (a.isLiteral() && a instanceof Literal) {
      if (a.hasDatatype()) {
        return a.getDatatype()!
      } else if (a.hasLang()) {
        return new IRI(rdf.RDF('langString'))
      }
      return new IRI(rdf.XSD('string'))
    }
    return StringLiteral.empty()
  },

  'iri': function (a: Term): Term {
    return new IRI(a.getValue())
  },

  'strdt': function (x: Term, datatype: Term): Term {
    if (datatype instanceof IRI) {
      return new StringLiteral(x.getValue(), datatype, null)
    }
    return new IRI('')
  },

  'strlang': function (x: Term, lang: Term): Term {
    return new StringLiteral(x.getValue(), null, lang.getValue())
  },

  'uuid': function (): Term {
    return new StringLiteral(`urn:uuid:${uuid()}`, null, null)
  },

  'struuid': function (): Term {
    return new StringLiteral(uuid(), null, null)
  },

  /*
    Functions on Strings https://www.w3.org/TR/sparql11-query/#func-strings
  */

  'strlen': function (a: Term): Term {
    return NumericLiteral.fromInteger(a.getValue().length)
  },

  'substr': function (str: Term, index: Term, length?: Term): Term {
    if (str instanceof StringLiteral && index instanceof NumericLiteral) {
      if (index.toJS() < 1) {
        throw new Error('SUBSTR error: the index of the first character in a string is 1 (according to the SPARQL W3C specs)')
      }
      let value = str.getValue().substring(index.toJS() - 1)
      if (length !== undefined && length instanceof NumericLiteral) {
        value = value.substring(0, length.toJS())
      }
      return new StringLiteral(value, str.getDatatype(), str.getLang())
    }
    return str
  },

  'ucase': function (a: Term): Term {
    if (a instanceof StringLiteral) {
      return new StringLiteral(a.getValue().toUpperCase(), a.getDatatype(), a.getLang())
    }
    return a
  },

  'lcase': function (a: Term): Term {
    if (a instanceof StringLiteral) {
      return new StringLiteral(a.getValue().toLowerCase(), a.getDatatype(), a.getLang())
    }
    return a
  },

  'strstarts': function (str: Term, substring: Term): Term {
    if (str instanceof StringLiteral && substring instanceof StringLiteral) {
      return BooleanLiteral.fromBoolean(str.getValue().startsWith(substring.getValue()))
    }
    return BooleanLiteral.fromFalse()
  },

  'strends': function (str: Term, substring: Term): Term {
    if (str instanceof StringLiteral && substring instanceof StringLiteral) {
      return BooleanLiteral.fromBoolean(str.getValue().endsWith(substring.getValue()))
    }
    return BooleanLiteral.fromFalse()
  },

  'contains': function (str: Term, substring: Term): Term {
    if (str instanceof StringLiteral && substring instanceof StringLiteral) {
      return BooleanLiteral.fromBoolean(str.getValue().indexOf(substring.getValue()) >= 0)
    }
    return BooleanLiteral.fromFalse()
  },

  'strbefore': function (str: Term, token: Term): Term {
    if (str instanceof StringLiteral && token instanceof StringLiteral) {
      const index = str.getValue().indexOf(token.getValue())
      const value = (index > -1) ? str.getValue().substring(0, index) : ''
      return new StringLiteral(value, str.getDatatype(), str.getLang())
    }
    return str
  },

  'strafter': function (str: Term, token: Term): Term {
    if (str instanceof StringLiteral && token instanceof StringLiteral) {
      const index = str.getValue().indexOf(token.getValue())
      const value = (index > -1) ? str.getValue().substring(index + token.getValue().length) : ''
      return new StringLiteral(value, str.getDatatype(), str.getLang())
    }
    return str
  },

  'encode_for_uri': function (a: Term): Term {
    return new StringLiteral(encodeURIComponent(a.getValue()), null, null)
  },

  'concat': function (a: Term, b: Term): Term {
    if (a instanceof StringLiteral && b instanceof StringLiteral) {
      return a.add(b)
    }
    throw new Error(`Cannot concatenate ${a.toRDF()} with ${b.toRDF()} because they are not strings.`)
  },

  'langmatches': function (langTag: Term, langRange: Term): Term {
    // Implements https://tools.ietf.org/html/rfc4647#section-3.3.1
    const tag = langTag.getValue().toLowerCase()
    const range = langRange.getValue().toLowerCase()
    const test = tag === range ||
                  range === '*' ||
                  tag.substr(1, range.length + 1) === range + '-'
    return BooleanLiteral.fromBoolean(test)
  },

  'regex': function (subject: Term, pattern: Term, flags?: Term) {
    let regexp = (flags === null || flags === undefined) ? new RegExp(pattern.getValue()) : new RegExp(pattern.getValue(), flags.getValue())
    return BooleanLiteral.fromBoolean(regexp.test(subject.getValue()))
  },

  /*
    Functions on Numerics https://www.w3.org/TR/sparql11-query/#func-numerics
  */

  'abs': function (a: Term): Term {
    if (a instanceof NumericLiteral) {
      return NumericLiteral.fromInteger(Math.abs(a.toJS()))
    }
    throw new Error(`Cannot calculate the absolute value of ${a.toRDF()}, as it is not a number.`)
  },

  'round': function (a: Term): Term {
    if (a instanceof NumericLiteral) {
      return NumericLiteral.fromInteger(Math.round(a.toJS()))
    }
    throw new Error(`Cannot calculate the rounded value of ${a.toRDF()}, as it is not a number.`)
  },

  'ceil': function (a: Term): Term {
    if (a instanceof NumericLiteral) {
      return NumericLiteral.fromInteger(Math.ceil(a.toJS()))
    }
    throw new Error(`Cannot calculate the ceil value of ${a.toRDF()}, as it is not a number.`)
  },

  'floor': function (a: Term): Term {
    if (a instanceof NumericLiteral) {
      return NumericLiteral.fromInteger(Math.floor(a.toJS()))
    }
    throw new Error(`Cannot calculate the floor value of ${a.toRDF()}, as it is not a number.`)
  },

  /*
    Functions on Dates and Times https://www.w3.org/TR/sparql11-query/#func-date-time
  */

  'now': function (): Term {
    return DateLiteral.now()
  },

  'year': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.year())
    }
    throw new Error(`Cannot get the year of ${a.toRDF()}, as it is not a date.`)
  },

  'month': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.month())
    }
    throw new Error(`Cannot get the month of ${a.toRDF()}, as it is not a date.`)
  },

  'day': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.day())
    }
    throw new Error(`Cannot get the day of ${a.toRDF()}, as it is not a date.`)
  },

  'hours': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.hours())
    }
    throw new Error(`Cannot get the hours of ${a.toRDF()}, as it is not a date.`)
  },

  'minutes': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.minutes())
    }
    throw new Error(`Cannot get the minutes of ${a.toRDF()}, as it is not a date.`)
  },

  'seconds': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.seconds())
    }
    throw new Error(`Cannot get the seconds of ${a.toRDF()}, as it is not a date.`)
  },

  'tz': function (a: Term): Term {
    if (a instanceof DateLiteral) {
      return NumericLiteral.fromInteger(a.utcOffset() / 60)
    }
    throw new Error(`Cannot get the timezone of ${a.toRDF()}, as it is not a date.`)
  },

  /*
    Hash Functions https://www.w3.org/TR/sparql11-query/#func-hash
  */

  'md5': applyHash('md5'),
  'sha1': applyHash('sha1'),
  'sha256': applyHash('sha256'),
  'sha384': applyHash('sha384'),
  'sha512': applyHash('sha512')
}
