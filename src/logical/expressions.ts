/* file : expressions.ts
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
import { isString, isArray, isEqual } from 'lodash'
import { Algebra } from 'sparqljs'

export class SPARQLExpression {
  private readonly _args: Array<Term | Term[] | SPARQLExpression>
  private readonly _operator: string

  constructor (args: Array<Term | Term[] | SPARQLExpression>, operator: string) {
    this._args = args
    this._operator = operator
  }

  static fromObject (obj: Algebra.SPARQLExpression): SPARQLExpression {
    const args = obj.args.map(arg => {
      if (isString(arg)) {
        return parseTerm(arg)
      } else if (isArray(arg)) {
        return arg.map(v => parseTerm(v))
      } else {
        return SPARQLExpression.fromObject(arg)
      }
    })
    return new SPARQLExpression(args, obj.operator)
  }

  getAllArguments (): Array<Term | Term[] | SPARQLExpression> {
    return this._args
  }

  getArgument (index: number): Term | Term[] | SPARQLExpression {
    return this._args[index]
  }

  getOperator (): string {
    return this._operator
  }

  equals (other: SPARQLExpression): boolean {
    return this._operator === other.getOperator() && isEqual(this._args, other.getAllArguments())
  }
}

export class FunctionCall {
  private readonly _args: Array<Term | Term[] | SPARQLExpression>
  private readonly _operator: string
  private readonly _distinct: boolean

  constructor (args: Array<Term | Term[] | SPARQLExpression>, operator: string, distinct: boolean) {
    this._args = args
    this._operator = operator
    this._distinct = distinct
  }

  static fromObject (obj: Algebra.FunctionCallExpression): FunctionCall {
    const args = obj.args.map(arg => {
      if (isString(arg)) {
        return parseTerm(arg)
      } else if (isArray(arg)) {
        return arg.map(v => parseTerm(v))
      } else {
        return SPARQLExpression.fromObject(arg)
      }
    })
    return new FunctionCall(args, obj.function, obj.distinct)
  }

  isDistinct (): boolean {
    return this._distinct
  }

  getAllArguments (): Array<Term | Term[] | SPARQLExpression> {
    return this._args
  }

  getArgument (index: number): Term | Term[] | SPARQLExpression {
    return this._args[index]
  }

  getOperator (): string {
    return this._operator
  }
}


export class Aggregationexpression {
  private readonly _args: Array<Term | Term[] | SPARQLExpression>
  private readonly _operator: string
  private readonly _distinct: boolean

  constructor (args: Array<Term | Term[] | SPARQLExpression>, operator: string, distinct: boolean) {
    this._args = args
    this._operator = operator
    this._distinct = distinct
  }

  static fromObject (obj: Algebra.FunctionCallExpression): FunctionCall {
    const args = obj.args.map(arg => {
      if (isString(arg)) {
        return parseTerm(arg)
      } else if (isArray(arg)) {
        return arg.map(v => parseTerm(v))
      } else {
        return SPARQLExpression.fromObject(arg)
      }
    })
    return new FunctionCall(args, obj.function, obj.distinct)
  }

  isDistinct (): boolean {
    return this._distinct
  }

  getAllArguments (): Array<Term | Term[] | SPARQLExpression> {
    return this._args
  }

  getArgument (index: number): Term | Term[] | SPARQLExpression {
    return this._args[index]
  }

  getOperator (): string {
    return this._operator
  }
}
