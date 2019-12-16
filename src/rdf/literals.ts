/* file : literals.ts
MIT License

Copyright (c) 2019 Thomas Minier

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

import { Term, Literal, IRI } from './rdf-terms'
import { rdf } from '../utils'
import { parseZone, Moment } from 'moment'
import moment = require('moment')

/**
 * Exception thrown when an invalid operation is called on a RDF Literal
 */
export class LiteralOperationError extends Error {}

/**
 * Parse a literal from its N3 representation
 * @param value - Literal value
 * @param datatype - Datatype value (null if the literal has no datatype)
 * @param lang - Lang value (null if the literal has no language tag)
 */
export function parseLiteral (value: string, datatype: string | null, lang: string | null): Literal {
  let datatypeIRI = null
  if (datatype !== null) {
    datatypeIRI = new IRI(datatype)
  }
  switch (datatype) {
    case rdf.XSD('integer'):
    case rdf.XSD('byte'):
    case rdf.XSD('short'):
    case rdf.XSD('int'):
    case rdf.XSD('unsignedByte'):
    case rdf.XSD('unsignedShort'):
    case rdf.XSD('unsignedInt'):
    case rdf.XSD('number'):
    case rdf.XSD('float'):
    case rdf.XSD('decimal'):
    case rdf.XSD('double'):
    case rdf.XSD('long'):
    case rdf.XSD('unsignedLong'):
    case rdf.XSD('positiveInteger'):
    case rdf.XSD('nonPositiveInteger'):
    case rdf.XSD('negativeInteger'):
    case rdf.XSD('nonNegativeInteger'):
      return new NumericLiteral(value, datatypeIRI)
    case rdf.XSD('boolean'):
      return new BooleanLiteral(value)
    case rdf.XSD('dateTime'):
    case rdf.XSD('dateTimeStamp'):
    case rdf.XSD('date'):
    case rdf.XSD('time'):
    case rdf.XSD('duration'):
      return new DateLiteral(value, datatypeIRI)
    case rdf.XSD('hexBinary'):
      return new BufferLiteral(value, 'hex', datatypeIRI)
    case rdf.XSD('base64Binary'):
      return new BufferLiteral(value, 'base64', datatypeIRI)
    default:
      return new StringLiteral(value, datatypeIRI, lang)
  }
}

/**
 * A Literal that represents a Number
 * @author Thomas Minier
 */
export class NumericLiteral extends Literal {
  private _numericValue: number
  constructor (value: string, datatype: IRI | null) {
    super(value, datatype, null)
    this._numericValue = Number(value)
  }

  static fromInteger (value: number): NumericLiteral {
    return new NumericLiteral(`${value}`, new IRI(rdf.XSD('integer')))
  }

  static fromFloat (value: number): NumericLiteral {
    return new NumericLiteral(`${value}`, new IRI(rdf.XSD('float')))
  }

  equals (other: Term): boolean {
    if (other.isLiteral() && other instanceof NumericLiteral) {
      return this.toJS() === other.toJS()
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isLiteral() && other instanceof NumericLiteral) {
      if (this.toJS() < other.toJS()) {
        return -1
      } else if (this.toJS() > other.toJS()) {
        return 1
      }
      return 0
    }
    return super.compareTo(other)
  }

  add (other: Literal): Literal {
    const lit = new NumericLiteral('0', this.getDatatype())
    if (other instanceof NumericLiteral) {
      lit._numericValue = this._numericValue + other.toJS()
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._numericValue = this._numericValue + Number(other.toJS())
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} + ${other.toRDF()}". Reason: Cannot add a numeric literal with someting that isn't a number or a boolean.`)
  }

  minus (other: Literal): Literal {
    const lit = new NumericLiteral('0', this.getDatatype())
    if (other instanceof NumericLiteral) {
      lit._numericValue = this._numericValue - other.toJS()
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._numericValue = this._numericValue - Number(other.toJS())
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} - ${other.toRDF()}". Reason: Cannot substract a numeric literal with someting that isn't a number or a boolean.`)
  }

  multiply (other: Literal): Literal {
    const lit = new NumericLiteral('0', this.getDatatype())
    if (other instanceof NumericLiteral) {
      lit._numericValue = this._numericValue * other.toJS()
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._numericValue = this._numericValue * Number(other.toJS())
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} * ${other.toRDF()}". Reason: Cannot multiply a numeric literal with someting that isn't a number or a boolean.`)
  }

  div (other: Literal): Literal {
    const lit = new NumericLiteral('0', this.getDatatype())
    if (other instanceof NumericLiteral) {
      lit._numericValue = this._numericValue / other.toJS()
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._numericValue = this._numericValue / Number(other.toJS())
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} / ${other.toRDF()}". Reason: Cannot divide a numeric literal with someting that isn't a number or a boolean.`)
  }

  toJS (): number {
    return this._numericValue
  }
}

/**
 * A Literal that represents a String
 * @author Thomas Minier
 */
export class StringLiteral extends Literal {
  constructor (value: string, datatype: IRI | null, lang: string | null) {
    super(value, datatype, lang)
  }

  static empty (): StringLiteral {
    return new StringLiteral('', null, null)
  }

  equals (other: Term): boolean {
    if (other.isLiteral() && other instanceof StringLiteral) {
      return this.getValue() === other.getValue()
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isLiteral() && other instanceof StringLiteral) {
      if (this.getValue() < other.getValue()) {
        return -1
      } else if (this.getValue() > other.getValue()) {
        return 1
      }
      return 0
    }
    return super.compareTo(other)
  }

  add (other: Literal): Literal {
    if (other instanceof StringLiteral) {
      return new StringLiteral(this.toJS() + other.toJS(), this.getDatatype(), this.getLang())
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} + ${other.toRDF()}". Reason: Cannot concatenate a string literal with someting that isn't a string.`)
  }

  minus (other: Literal): Literal {
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} - ${other.toRDF()}". Reason: Cannot perform a substration between two strings.`)
  }

  multiply (other: Literal): Literal {
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} * ${other.toRDF()}". Reason: Cannot perform a multiplication between two strings.`)
  }

  div (other: Literal): Literal {
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} / ${other.toRDF()}". Reason: Cannot perform a division between two strings.`)
  }

  toJS (): string {
    return this.getValue()
  }
}

/**
 * A Literal that represents a Boolean
 * @author Thomas Minier
 */
export class BooleanLiteral extends Literal {
  private _booleanValue: boolean
  constructor (value: string) {
    super(value, new IRI(rdf.XSD('boolean')), null)
    this._booleanValue = value === 'true' || value === '1'
  }

  static fromBoolean (value: boolean): BooleanLiteral {
    return new BooleanLiteral(`${value}`)
  }

  static fromTrue (): BooleanLiteral {
    return new BooleanLiteral('true')
  }

  static fromFalse (): BooleanLiteral {
    return new BooleanLiteral('false')
  }

  equals (other: Term): boolean {
    if (other.isLiteral() && other instanceof BooleanLiteral) {
      return this.toJS() === other.toJS()
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isLiteral() && other instanceof BooleanLiteral) {
      if (this.toJS() < other.toJS()) {
        return -1
      } else if (this.toJS() > other.toJS()) {
        return 1
      }
      return 0
    }
    return super.compareTo(other)
  }

  add (other: Literal): Literal {
    const lit = new BooleanLiteral('0')
    if (other instanceof BooleanLiteral) {
      lit._booleanValue = this._booleanValue && other.toJS()
      return lit
    } else if (other instanceof NumericLiteral) {
      lit._booleanValue = Number(this._booleanValue) + other.toJS() === 1
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} + ${other.toRDF()}". Reason: Cannot add a boolean literal with someting that isn't a boolean or a number.`)
  }

  minus (other: Literal): Literal {
    const lit = new BooleanLiteral('0')
    if (other instanceof BooleanLiteral) {
      lit._booleanValue = this._booleanValue || other.toJS()
      return lit
    } else if (other instanceof NumericLiteral) {
      lit._booleanValue = Number(this._booleanValue) - other.toJS() === 1
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} + ${other.toRDF()}". Reason: Cannot substraction a boolean literal with someting that isn't a boolean or a number.`)
  }

  multiply (other: Literal): Literal {
    if (other instanceof NumericLiteral) {
      const lit = new BooleanLiteral('0')
      lit._booleanValue = Number(this._booleanValue) * other.toJS() === 1
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} * ${other.toRDF()}". Reason: Cannot multiply a boolean literal with someting that isn't a number.`)
  }

  div (other: Literal): Literal {
    if (other instanceof NumericLiteral) {
      const lit = new BooleanLiteral('0')
      lit._booleanValue = Number(this._booleanValue) / other.toJS() === 1
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} / ${other.toRDF()}". Reason: Cannot divide a boolean literal with someting that isn't a number.`)
  }

  toJS (): boolean {
    return this._booleanValue
  }
}

/**
 * A Literal that represents a Date
 * @author Thomas Minier
 */
export class DateLiteral extends Literal {
  private _dateValue: Moment
  constructor (value: string, datatype: IRI | null) {
    super(value, datatype, null)
    this._dateValue = parseZone(value)
  }

  static now () {
    return new DateLiteral(moment().toISOString(), new IRI(rdf.XSD('dateTime')))
  }

  equals (other: Term): boolean {
    if (other.isLiteral() && other instanceof StringLiteral) {
      return this._dateValue.isSame(other.toJS())
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isLiteral() && other instanceof StringLiteral) {
      if (this._dateValue.isBefore(other.toJS())) {
        return -1
      } else if (this._dateValue.isAfter(other.toJS())) {
        return 1
      }
      return 0
    }
    return super.compareTo(other)
  }

  add (other: Literal): Literal {
    const lit = new DateLiteral(this.getValue(), this.getDatatype())
    if (other instanceof DateLiteral || other instanceof NumericLiteral) {
      lit._dateValue = moment(this._dateValue.valueOf() + other.toJS().valueOf())
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._dateValue = this.toJS().add(Number(other.toJS()), 'seconds')
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} + ${other.toRDF()}". Reason: Cannot add a date literal with someting that isn't a date, number or boolean.`)
  }

  minus (other: Literal): Literal {
    const lit = new DateLiteral(this.getValue(), this.getDatatype())
    if (other instanceof DateLiteral || other instanceof NumericLiteral) {
      lit._dateValue = moment(this._dateValue.valueOf() - other.toJS().valueOf())
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._dateValue = this.toJS().subtract(Number(other.toJS()), 'seconds')
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} + ${other.toRDF()}". Reason: Cannot substraction a date literal with someting that isn't a date, number or boolean.`)
  }

  multiply (other: Literal): Literal {
    const lit = new DateLiteral(this.getValue(), this.getDatatype())
    if (other instanceof DateLiteral || other instanceof NumericLiteral) {
      lit._dateValue = moment(this._dateValue.valueOf() * other.toJS().valueOf())
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._dateValue = moment(this._dateValue.valueOf() * Number(other.toJS()))
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} * ${other.toRDF()}". Reason: Cannot multiply a date literal with someting that isn't a date, number or boolean.`)
  }

  div (other: Literal): Literal {
    const lit = new DateLiteral(this.getValue(), this.getDatatype())
    if (other instanceof DateLiteral || other instanceof NumericLiteral) {
      lit._dateValue = moment(this._dateValue.valueOf() / other.toJS().valueOf())
      return lit
    } else if (other instanceof BooleanLiteral) {
      lit._dateValue = moment(this._dateValue.valueOf() / Number(other.toJS()))
      return lit
    }
    throw new LiteralOperationError(`Failed to perform the following operation: "${this.toRDF()} / ${other.toRDF()}". Reason: Cannot divide a date literal with someting that isn't a date, number or boolean.`)
  }

  /**
   * Get the date's year
   */
  year (): number {
    return this._dateValue.year()
  }

  /**
   * Get the date's month
   */
  month (): number {
    return this._dateValue.month()
  }

  /**
   * Get the date's day
   */
  day (): number {
    return this._dateValue.day()
  }

  /**
   * Get the date's hours
   */
  hours (): number {
    return this._dateValue.hours()
  }

  /**
   * Get the date's minutes
   */
  minutes (): number {
    return this._dateValue.minutes()
  }

  /**
   * Get the date's seconds
   */
  seconds (): number {
    return this._dateValue.seconds()
  }

  /**
   * Get the date's milliseconds
   */
  milliseconds (): number {
    return this._dateValue.milliseconds()
  }

  /**
   * Get the date's UTC Offset
   */
  utcOffset (): number {
    return this._dateValue.utcOffset()
  }

  toJS (): Moment {
    return this._dateValue
  }
}

/**
 * A Literal that represents a Buffer (hex, base64, ...)
 * @author Thomas Minier
 */
export class BufferLiteral extends Literal {
  private readonly _bufferValue: Buffer
  constructor (value: string, format: string, datatype: IRI | null) {
    super(value, datatype, null)
    this._bufferValue = Buffer.from(value, format)
  }

  equals (other: Term): boolean {
    if (other.isLiteral() && other instanceof BufferLiteral) {
      return this._bufferValue.equals(other.toJS())
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isLiteral() && other instanceof BufferLiteral) {
      return this._bufferValue.compare(other.toJS())
    }
    return super.compareTo(other)
  }

  toJS (): Buffer {
    return this._bufferValue
  }
}
