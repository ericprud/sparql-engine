/* file : node-base.ts
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

/**
 * An abstract node in a logical SPARQL query execution plan
 * @author Thomas Minier
 */
export interface Node {
  /**
   * Test if two nodes are equals
   * @param other - Node to test for equality
   * @return True if the two nodes are equals, False otherwise
   */
  equals (other: Node): boolean
}

/**
 * A logical node that takes another node as input
 * @author Thomas Minier
 */
export abstract class NodeUnary implements Node {
  private readonly _innerNode: Node

  constructor (innerNode: Node) {
    this._innerNode = innerNode
  }

  abstract equals (other: Node): boolean

  /**
   * Get the input node
   */
  getNode (): Node {
    return this._innerNode
  }
}

/**
 * A logical node that takes two other nodes as input
 * @author Thomas Minier
 */
export abstract class NodeBinary implements Node {
  private readonly _leftNode: Node
  private readonly _rightNode: Node

  constructor (leftNode: Node, rightNode: Node) {
    this._leftNode = leftNode
    this._rightNode = rightNode
  }

  abstract equals (other: Node): boolean

  /**
   * Get the left input node
   * @return The left input node
   */
  getLeftNode (): Node {
    return this._leftNode
  }

  /**
   * Get the right input node
   * @return The right input node
   */
  getRightNode (): Node {
    return this._rightNode
  }
}
