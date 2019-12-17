/* file : node-path.ts
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

import { Term, parseTerm } from '../rdf/rdf-model'
import { Node } from './node-base'
import { Algebra } from 'sparqljs'
import { isString, isEqualWith } from 'lodash'

/**
 * The declaration of a Path in a property path, e.g., "rdfs:label/foaf:knows*"
 */
export class Path {
  private readonly _items: Array<Term | Path>
  private readonly _pathType: string

  constructor (items: Array<Term | Path>, pathType: string) {
    this._items = items
    this._pathType = pathType
  }

  /**
   * Build a {@link Path} from its sparql.js representation
   * @param obj - Object representation in sparql.js format
   */
  static fromObject (obj: Algebra.PropertyPath): Path {
    const items = obj.items.map(item => {
      if (isString(item)) {
        return parseTerm(item)
      }
      return Path.fromObject(item)
    })
    return new Path(items, obj.pathType)
  }

  getItems (): Array<Term | Path> {
    return this._items
  }

  getType (): string {
    return this._pathType
  }

  /**
   * Test if two {@link Path} objects are equals
   * @param ref - Reference {@link Path}
   * @param other - {@link Path} to compare with
   * @return True if the two are equals, False otherwise
   */
  equals (other: Path): boolean {
    if (this._pathType === other.getType()) {
      return isEqualWith(this._items, other.getItems(), (left: Term | Path, right: Term | Path) => {
        if (left instanceof Path && right instanceof Path) {
          return left.equals(right)
        } else if (!(left instanceof Path) && !(right instanceof Path)) {
          return left.equals(right)
        }
        return false
      })
    }
    return true
  }
}

/**
 * An operation that must evaluates a triple pattern against a RDF Graph
 * @author Thomas Minier
 */
export class NodePath implements Node {
  private readonly _subject: Term
  private readonly _object: Term
  private readonly _path: Path

  constructor (subject: Term, path: Path, object: Term) {
    this._subject = subject
    this._path = path
    this._object = object
  }

  /**
   * Build a {@link NodePath} from its representation in sparql.js
   * @param obj - Object representation in sparql.js format
   * @return A NodePath
   */
  static fromObject (obj: Algebra.PathTripleObject): NodePath {
    return new NodePath(parseTerm(obj.subject), Path.fromObject(obj.predicate), parseTerm(obj.object))
  }

  /**
   * Get the property path subject, i.e. its starting term
   */
  getSubject (): Term {
    return this._subject
  }

  /**
   * Get the property path subject, i.e. its starting term
   */
  getPath (): Path {
    return this._path
  }

  /**
   * Get the property path subject, i.e. its starting term
   */
  getObject (): Term {
    return this._object
  }

  equals (other: Node): boolean {
    return other instanceof NodePath && this._subject.equals(other.getSubject()) && this._object.equals(other.getObject()) && this._path.equals(other.getPath())
  }
}
