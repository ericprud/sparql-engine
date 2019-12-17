/* file : node-triple.ts
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

import { Triple, parseTriple } from '../rdf/rdf-model'
import { Node } from './node-base'
import { Algebra } from 'sparqljs'

/**
 * An operation that must evaluates a triple pattern against a RDF Graph
 * @author Thomas Minier
 */
export default class NodeTriple implements Node {
  private readonly _triple: Triple

  constructor (triple: Triple) {
    this._triple = triple
  }

  /**
   * Build a {@link NodeTriple} from its representation in sparql.js
   * @param obj - Object representation in sparql.js format
   * @return A NodeTriple
   */
  static fromObject (obj: Algebra.TripleObject): NodeTriple {
    return new NodeTriple(parseTriple(obj.subject, obj.predicate, obj.object))
  }

  /**
   * Get the Node inner triple pattern
   */
  getTriple (): Triple {
    return this._triple
  }

  equals (other: Node): boolean {
    return other instanceof NodeTriple && this._triple.equals(other.getTriple())
  }
}
