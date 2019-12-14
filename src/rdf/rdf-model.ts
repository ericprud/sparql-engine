/* file : utils.ts
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

import { Term, IRI, Variable } from './rdf-terms'
import { Util } from 'n3'
import { parseLiteral } from './literals'
export { default as Triple } from './rdf-triple'
export { Term, IRI, Literal, Variable } from './rdf-terms'

/**
 * Remove surrounding brackets from an IRI
 * @private
 * @param iri - IRI to cleanup
 * @return Transformed IRI
 */
function cleanIRI (iri: string): string {
  if (iri.startsWith('<') && iri.endsWith('>')) {
    return iri.slice(1, iri.length - 1)
  }
  return iri
}

/**
 * Parse a RDF Term into the appropriate representation
 * @param term RDF term to parse
 * @return Parsed RDF Term
 */
export function parseTerm (term: string): Term {
  if (term.startsWith('?')) {
    return new Variable(term)
  } else if (term.startsWith('\"')) {
    const value = Util.getLiteralValue(term)
    const lang = Util.getLiteralLanguage(term)
    const type = cleanIRI(Util.getLiteralType(term))
    return parseLiteral(value, type, lang)
  } else if (term.startsWith('<') || term.startsWith('http') || Util.isIRI(term)) {
    return new IRI(term)
  }
  throw new SyntaxError(`Unkown RDF Term found during parsing: ${term}`)
}
