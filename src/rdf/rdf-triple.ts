/* file : rdf-triple.ts
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

import { Term } from './rdf-terms'

/**
 * A RDF Triple (pattern)
 * @author Thomas Minier
 */
export default class Triple {
  private readonly _subject: Term
  private readonly _predicate: Term
  private readonly _object: Term

  constructor (s: Term, p: Term, o: Term) {
    this._subject = s
    this._predicate = p
    this._object = o
  }

  getSubject (): Term {
    return this._subject
  }

  getPredicate (): Term {
    return this._predicate
  }

  getObject (): Term {
    return this._object
  }

  equals (other: Triple): boolean {
    return this._subject.equals(other.getSubject()) && this._predicate.equals(other.getPredicate()) && this._object.equals(other.getObject())
  }

  compareTo (other: Triple): number {
    const subjTest = this._subject.compareTo(other.getSubject())
    if (subjTest !== 0) {
      return subjTest
    }
    const predTest = this._predicate.compareTo(other.getPredicate())
    if (predTest !== 0) {
      return predTest
    }
    return this._object.compareTo(other.getObject())
  }

  toRDF (): string {
    return `${this._subject.toRDF()} ${this._predicate.toRDF()} ${this._object.toRDF()}`
  }

}
