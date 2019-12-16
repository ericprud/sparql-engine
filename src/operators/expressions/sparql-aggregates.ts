/* file : sparql-aggregates.ts
MIT License

Copyright (c) 2018 Thomas Minier

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

import { Term } from '../../rdf/rdf-model'
import { NumericLiteral, StringLiteral } from '../../rdf/literals'
import { maxBy, minBy, sample } from 'lodash'

/**
 * SPARQL Aggregation operations.
 * Each operation takes as argument a list of RDF terms on which the aggregation must be applied.
 * Each operations is expected to return a RDF term
 * @see https://www.w3.org/TR/sparql11-query/#aggregateAlgebra
 * @author Thomas Minier
 */
export default {
  'count': function (rows: Term[]): Term {
    return NumericLiteral.fromInteger(rows.length)
  },

  'sum': function (rows: Term[]): Term {
    let sum = rows
      .filter(term => term instanceof NumericLiteral)
      .reduce((prev, term) => {
        return prev + term.toJS()
      }, 0)
    return NumericLiteral.fromInteger(sum)
  },

  'avg': function (rows: Term[]): Term {
    let sum = 0
    let count = 0
    rows
      .filter(term => term instanceof NumericLiteral)
      .forEach(term => {
        sum += term.toJS()
        count++
      })
    return NumericLiteral.fromFloat(sum / count)
  },

  'min': function (rows: Term[]): Term {
    return minBy(rows, term => term.toJS())!
  },

  'max': function (rows: Term[]): Term {
    return maxBy(rows, term => term.toJS())!
  },

  'group_concat': function (rows: Term[], sep: string): Term {
    return new StringLiteral(rows.map(term => term.toRDF()).join(sep), null, null)
  },

  'sample': function (rows: Term[]): Term {
    return sample(rows)!
  }
}
