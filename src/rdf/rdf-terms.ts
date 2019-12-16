/* file : data-model.ts
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

'use strict'

/**
 * An abstract RDF Term
 * @author Thomas Minier
 */
export interface Term {

  /**
   * Get the term value (as defined by implementations)
   * @return The value
   */
  getValue (): string

  /**
   * Test if two RDF terms are equals
   * @param  other - RDF term to test equality with
   * @return Ture if the two terms are equals, False otherwise
   */
  equals (other: Term): boolean

  /**
   * Compare two RDF Terms.
   * Returns a negative number if this < other, a positive number if 0 if this > other
   * or returns 0 if this === other.
   * @param  other - RDF term to compare with
   * @return -1 if this < other, 1 if this > other, 0 if this = other
   */
  compareTo (other: Term): number

  /**
   * Test if the term is an IRI
   * @return - True if the term is an IRI, False otherwise
   */
  isIRI (): boolean

  /**
   * Test if the term is a Literal
   * @return - True if the term is a Literal, False otherwise
   */
  isLiteral (): boolean

  /**
   * Test if the term is a SPARQL variable
   * @return - True if the term is a SPARQL, False otherwise
   */
  isVariable (): boolean

  /**
   * Convert the term into its string RDF representation
   * @return A string representation in RDF format
   */
  toRDF (): string

  /**
   * Convert the term into its javascript equivalent (string, number, object, etc).
   * @return A javascript element
   */
  toJS (): any
}

/**
 * Base class for implementing a concrete RDF term
 * @abstract
 * @author Thomas Minier
 */
export abstract class ConcreteTerm implements Term {
  private readonly _value: string

  constructor (value: string) {
    this._value = value
  }

  /**
   * Test if two RDF terms are equals
   * @param  other - RDF term to compare with
   * @return True if the RDF terms are equals, False otherwise
   */
  abstract equals (other: Term): boolean

  /**
   * Serialize the term into a RDF text format (n3, turtle, etc)
   * @return Serialized RDF term
   */
  abstract toRDF (): string

  /**
   * Serialize the RDF Term into a corresponding Javascript value
   * @return Javascript value
   */
  abstract toJS (): any

  getValue (): string {
    return this._value
  }

  /**
   * Compare the RDF term with another one
   * @param  other - RDF term to compare with
   * @return 1 if the curent term is greater than the other, -1 if lower or 0 if the two are equals.
   */
  compareTo (other: Term): number {
    if (this.toRDF() < other.toRDF()) {
      return -1
    } else if (this.toRDF() > other.toRDF()) {
      return 1
    }
    return 0
  }

  /**
   * Check if the RDF term in an IRI
   * @return True if the RDF term in an IRI, False otherwise
   */
  isIRI (): boolean {
    return false
  }

  /**
   * Check if the RDF term in a Literal
   * @return True if the RDF term in a Literal, False otherwise
   */
  isLiteral (): boolean {
    return false
  }

  /**
   * Check if the RDF term in a SPARQL variable
   * @return True if the RDF term in a SPARQL variable, False otherwise
   */
  isVariable (): boolean {
    return false
  }
}

/**
 * An intermediate format to represent RDF IRIs
 */
export class IRI extends ConcreteTerm {
  constructor (value: string) {
    super(value)
  }

  equals (other: Term): boolean {
    if (other.isIRI()) {
      let otherIri = other as IRI
      return this.getValue() === otherIri.getValue()
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isIRI()) {
      let otherIri = other as IRI
      if (this.getValue() < otherIri.getValue()) {
        return -1
      } else if (this.getValue() > otherIri.getValue()) {
        return 1
      }
      return 0
    }
    return super.compareTo(other)
  }

  toRDF (): string {
    return `<${this.getValue()}>`
  }

  toJS (): any {
    return this.getValue()
  }

  isIRI (): boolean {
    return true
  }
}

/**
 * An intermediate format to represent SPARQL variable
 * @author Thomas Minier
 */
export class Variable extends ConcreteTerm {
  private static _allocated: Map<string, Variable> = new Map<string, Variable>()

  /**
   * The constructor for this class is private.
   * To create new SPARQL variable, please use the static allocate method
   * @param value - Variable value
   */
  private constructor (value: string) {
    super(value)
  }

  /**
   * Build a new Variable or returns an exiting one.
   * This method ensure that only one variable is created per value.
   * @param value - Variable value
   * @return A Variable
   */
  static allocate (value: string): Variable {
    if (value.startsWith('?')) {
      value = value.slice(1)
    }
    if (!Variable._allocated.has(value)) {
      Variable._allocated.set(value, new Variable(value))
    }
    return Variable._allocated.get(value)!
  }

  equals (other: Term): boolean {
    if (other.isVariable()) {
      let otherVariable = other as Variable
      return this.getValue() === otherVariable.getValue()
    }
    return false
  }

  compareTo (other: Term): number {
    if (other.isVariable()) {
      let otherVariable = other as Variable
      if (this.getValue() < otherVariable.getValue()) {
        return -1
      } else if (this.getValue() > otherVariable.getValue()) {
        return 1
      }
      return 0
    }
    return super.compareTo(other)
  }

  toRDF (): string {
    return `?${this.getValue()}`
  }

  toJS (): any {
    return this.getValue()
  }

  isVariable (): boolean {
    return true
  }
}

/**
 * An intermediate format to represent RDF Literals
 */
export abstract class Literal extends ConcreteTerm {
  readonly _datatype: IRI | null
  readonly _lang: string | null

  constructor (value: string, datatype: IRI | null, lang: string | null) {
    super(value)
    this._datatype = datatype
    this._lang = lang
  }

  /**
   * Add the literal's value with another literal's value
   * @param other - Other literal to sum with
   * @return A literal that contains the sum of the two literals
   */
  abstract add (other: Literal): Literal

  /**
   * Substract the literal's value with another literal's value
   * @param other - Other literal to substract with
   * @return A literal that contains the substraction of the two literals
   */
  abstract minus (other: Literal): Literal

  /**
   * Multiply the literal's value with another literal's value
   * @param other - Other literal to multiply with
   * @return A literal that contains the multiplication of the two literals
   */
  abstract multiply (other: Literal): Literal

  /**
   * Divide the literal's value with another literal's value
   * @param other - Other literal to divide with
   * @return A literal that contains the division of the two literals
   */
  abstract div (other: Literal): Literal

  hasDatatype (): boolean {
    return this._datatype !== null
  }

  hasLang (): boolean {
    return this._lang !== null
  }

  getDatatype (): IRI | null {
    return this._datatype
  }

  getLang (): string | null {
    return this._lang
  }

  isLiteral (): boolean {
    return true
  }

  toRDF (): string {
    let res: string = `"${this.getValue()}"`
    if (this.hasLang()) {
      res += `@${this.getLang()!}`
    } else if (this.hasDatatype()) {
      res += `^^${this.getDatatype()!.toRDF()}`
    }
    return res
  }
}
