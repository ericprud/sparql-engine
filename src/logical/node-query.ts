/* file : node-query.ts
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

import { IRI, Triple, Variable } from '../rdf/rdf-model'
import { Node } from './node-base'

export class FromGraph {
  private readonly _iri: IRI
  private readonly _isDefault: boolean

  constructor (iri: IRI, isDefault: boolean) {
    this._iri = iri
    this._isDefault = isDefault
  }

  getIRI (): IRI {
    return this._iri
  }

  isDefault (): boolean {
    return this._isDefault
  }

  equals (other: FromGraph): boolean {
    return this._iri.equals(other.getIRI()) && this._isDefault === other.isDefault()
  }
}

export abstract class NodeQuery implements Node {
  private readonly _distinct?: boolean
  private readonly _prefixes: any
  private readonly _queryType: string
  private readonly _from: Array<FromGraph>
  private readonly _where: Node
  private readonly _group: Array<Aggregation>
  private readonly _having: Array<Expression>
  private readonly _order: Array<OrderComparator>
  private readonly _offset: number
  private readonly _limit: number

  

  abstract equals (other: Node): boolean
  
}

export class NodeSelect extends NodeQuery {
  private readonly _variables: Array<Variable | Aggregation>;

  equals (other: Node): boolean {
    throw new Error("Method not implemented.");
  }
}

export class NodeAsk extends NodeQuery {

  equals (other: Node): boolean {
    throw new Error("Method not implemented.");
  }
}

export class NodeConstruct extends NodeQuery {
  private readonly _template: Triple[]

  equals (other: Node): boolean {
    throw new Error("Method not implemented.");
  }
}
