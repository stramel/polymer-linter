/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import babelTraverse from 'babel-traverse';
import * as babel from 'babel-types';
import { Document, Severity, Warning } from 'polymer-analyzer';

import { registry } from '../registry';
import { Rule } from '../rule';
import { getDocumentContaining, stripIndentation, stripWhitespace } from '../util';


class RemovedApis extends Rule {
  code = 'removed-apis';
  description = stripIndentation(`
      Warns when the Polymer \`behaviors\` property is spelled \`behaviours\`,
      as Polymer uses the American spelling.

          Polymer({
            behaviours: [...]
          });

      Accepted syntax:

          Polymer({
            behaviors: [...]
          });
  `);

  private apiChecks: { checker: Function, replacement?: string | Function, message?: string }[] = [
    { checker: this.isPolymerInstanceof },
    { checker: this.is$$, replacement: 'shadowRoot.querySelector' },
  ];


  async check(document: Document) {
    const warnings: Warning[] = [];
    const docs = document.getFeatures({ kind: 'js-document' });
    if (docs.size === 0) {
      return warnings;
    }

    for (const doc of docs) {
      babelTraverse(doc.parsedDocument.ast, {
        noScope: true,
        enter: (path) => {
          for (const apiCheck of this.apiChecks) {
            if (!apiCheck.checker(path.node)) {
              continue;
            }

            const warning = new Warning({
              parsedDocument: doc.parsedDocument,
              code: this.code,
              severity: Severity.ERROR,
              message: apiCheck.message!,
              sourceRange: document.sourceRange!
            });

            if (typeof apiCheck.replacement === 'string') {

            }
          }
          // console.log('\n\n\n', path.node)

          // const name = path.node.callee.property.name;
          // const apiCheck = this.apiChecks.get(name);

          // console.log(path.node)
          // if (!apiCheck!.checker(path.node)) {
          //   return;
          // }



        }
      });
    }

    return warnings;
  }

  private isPolymerInstanceof(expr: babel.Expression): boolean {
    return babel.isCallExpression(expr) &&
      babel.isMemberExpression(expr.callee) &&
      babel.isIdentifier(expr.callee.object) &&
      babel.isIdentifier(expr.callee.property) &&
      expr.callee.object.name === 'Polymer' &&
      expr.callee.property.name === 'instanceof';
  }

  private is$$(expr: babel.Expression): boolean {
    return babel.isCallExpression(expr) &&
      babel.isMemberExpression(expr.callee) &&
      babel.isThisExpression(expr.callee.object) &&
      babel.isIdentifier(expr.callee.property) &&
      expr.callee.property.name === '$$';
  }

  private isEventFire(expr: babel.Expression): boolean {
    return babel.isCallExpression(expr) &&
      babel.isMemberExpression(expr.callee) &&
      babel.isThisExpression(expr.callee.object) &&
      babel.isIdentifier(expr.callee.property) &&
      expr.callee.property.name === 'fire';
  }
  private replaceEventFire() {

  }
}

registry.register(new RemovedApis());
