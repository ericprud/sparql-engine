/* file : results-formatter.js
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

import { PipelineStage } from '../engine/pipeline/pipeline-engine'
import { Pipeline } from '../engine/pipeline/pipeline'
import { Bindings } from '../rdf/bindings'

/**
 * [_format description]
 * @author Thomas Minier
 */
export default abstract class ResultsFormatter<T> {

  /**
   * [_format description]
   * @param  bindings [description]
   * @return          [description]
   */
  abstract _format(bindings: Bindings): T;

  /**
   * [_prepend description]
   * @param  bindings [description]
   * @return          [description]
   */
  _prepend(bindings: Bindings): T | null {
    return null
  }

  /**
   * [_append description]
   * @return [description]
   */
  _append(): T | null {
    return null
  }

  /**
   * [apply description]
   * @param  source [description]
   * @return        [description]
   */
  apply (source: PipelineStage<Bindings>): PipelineStage<T> {
    const engine = Pipeline.getInstance()
    let first = true
    return engine.merge(engine.flatMap(source, bindings => {
      const res: T[] = []
      // use first bindings to call prepend
      if (first) {
        const head = this._prepend(bindings)
        if (head !== null) {
          res.push(head)
        }
        first = false
      }
      res.push(this._format(bindings))
      return res
    }), engine.of(this._append()!))
  }
}
