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

import { Term, Literal, IRI } from './data-model'
import { rdf } from '../utils'
import { parseZone, Moment } from 'moment'

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
      return new NumericLiteral(value, datatypeIRI, lang)
    case rdf.XSD('boolean'):
      return new BooleanLiteral(value, datatypeIRI, lang)
    case rdf.XSD('dateTime'):
    case rdf.XSD('dateTimeStamp'):
    case rdf.XSD('date'):
    case rdf.XSD('time'):
    case rdf.XSD('duration'):
      return new DateLiteral(value, datatypeIRI, lang)
    case rdf.XSD('hexBinary'):
      return new BufferLiteral(value, 'hex', datatypeIRI, lang)
    case rdf.XSD('base64Binary'):
      return new BufferLiteral(value, 'base64', datatypeIRI, lang)
    default:
      return new StringLiteral(value, datatypeIRI, lang)
  }
}

/**
 * A Literal that representes a Number
 * @author Thomas Minier
 */
export class NumericLiteral extends Literal {
  private readonly _numericValue: number
  constructor (value: string, datatype: IRI | null, lang: string | null) {
    super(value, datatype, lang)
    this._numericValue = Number(value)
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

  toJS (): number {
    return this._numericValue
  }
}

/**
 * A Literal that representes a String
 * @author Thomas Minier
 */
export class StringLiteral extends Literal {
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

  toJS (): string {
    return this.getValue()
  }
}

/**
 * A Literal that representes a Boolean
 * @author Thomas Minier
 */
export class BooleanLiteral extends Literal {
  private readonly _booleanValue: boolean
  constructor (value: string, datatype: IRI | null, lang: string | null) {
    super(value, datatype, lang)
    this._booleanValue = value === '"true"' || value === '"1"'
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

  toJS (): boolean {
    return this._booleanValue
  }
}

/**
 * A Literal that representes a Date
 * @author Thomas Minier
 */
export class DateLiteral extends Literal {
  private readonly _dateValue: Moment
  constructor (value: string, datatype: IRI | null, lang: string | null) {
    super(value, datatype, lang)
    this._dateValue = parseZone(value)
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

  toJS (): Moment {
    return this._dateValue
  }
}

/**
 * A Literal that representes a Buffer (hex, base64, ...)
 * @author Thomas Minier
 */
export class BufferLiteral extends Literal {
  private readonly _bufferValue: Buffer
  constructor (value: string, format: string, datatype: IRI | null, lang: string | null) {
    super(value, datatype, lang)
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
