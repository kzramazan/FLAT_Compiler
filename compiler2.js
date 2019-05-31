function lexer(input) {

    let current = 0;
  
    let tokens = [];

    var isKeyword = false;

    var funcNameStarted  = false;
  
    while (current < input.length) {
  
      let char = input[current];
      
      let LETTERS = /[a-z]/i;
      if (LETTERS.test(char)) {
        let value = '';
  
        while (LETTERS.test(char)) {
          value += char;
          char = input[++current];
          nextVal = char
          if (funcNameStarted && char == " "){
            tokens.push({ type: 'funcName', value : value });
            char = input[++current];
            funcNameStarted = false;
          }
          else if (value === "print" && nextVal === " "){
            tokens.push({ type: 'keyword', value : "print" });
            char = input[++current];
          }
          else if (value === "return" && nextVal === " "){
            tokens.push({ type: 'keyword', value : "return" });
            char = input[++current];
          }
          else if (value === "func" && nextVal === " "){
            tokens.push({ type: 'func', value : "func" });
            funcNameStarted = true;
            char = input[++current];
            value = '';
          }
          else if (value === "if"){
            tokens.push({ type: 'if', value : "if" });
            char = input[++current];
          }
          isKeyword = true;
        }

        if(!isKeyword){
            tokens.push({ type: 'name', value });
            continue;
        }
      }

      if (char === '(' || char === ')') {
  
        tokens.push({
          type: 'paren',
          value: char,
        });

        current++;
        continue;
      }

      if (char === '+' || char === '-' || char === '/' || char === '*' || char === '%') {
  
        tokens.push({
          type: 'arithmeticOperators',
          value: char,
        });

        current++;
        continue;
      }

      if (char === '{' || char === '}') {
  
        tokens.push({
          type: 'curlyBraces',
          value: char,
        });

        current++;
        continue;
      }
      
      if (char === '>' || char === '<' || char === '==' || char === '<=' || char === '>=') {
  
        tokens.push({
          type: 'conditionals',
          value: char,
        });

        current++;
        continue;
      }
  
      let WHITESPACE = /\s/;
      if (WHITESPACE.test(char)) {
        current++;
        continue;
      }
  
    
      let NUMBERS = /[0-9]/;
      if (NUMBERS.test(char)) {
  
        let value = '';
  
        while (NUMBERS.test(char)) {
          value += char;
          char = input[++current];
        }
  
        tokens.push({ type: 'number', value });
  
        continue;
      }
  
      if (char === '"') {
        
        let value = '';
  
        char = input[++current];
  
        while (char !== '"') {
          value += char;
          char = input[++current];
        }
  
        char = input[++current];
        tokens.push({ type: 'string', value });
  
        continue;
      }
  
     
      isKeyword = false;
      throw new TypeError('I dont know what this character is: ' + char);
    }
    return tokens;
  }
  /**
 * ============================================================================
 *                                 ヽ/❀o ل͜ o\ﾉ
 *                                THE PARSER!!!
 * ============================================================================
 */

/**
 * For our parser we're going to take our array of tokens and turn it into an
 * AST.
 *
 *   [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 */

// Okay, so we define a `parser` function that accepts our array of `tokens`.
function parser(tokens) {

    let current = 0;
    var bodyOpened = false;
    function walk() {
  
      var token = tokens[current];
      if(!token){
        current++;
        return;
      }

      if (token.type === 'number') {
  
        current++;
  
        return {
          type: 'NumberLiteral',
          value: token.value,
        };
      }
  
      if (token.type === 'string') {
        current++;
  
        return {
          type: 'StringLiteral',
          value: token.value,
        };
      }

      else if (token.type === 'conditionals') {
        current++;
        return {
            type: 'Condition',
            name: token.value,
        };
      }

      else if (token.type === 'arithmeticOperators') {
        current++;
        return {
            type: 'arithmeticOperator',
            name: token.value,
        };
      }

      else if (token.type === 'if') {
        let node = {
            type: 'ConditionKeyword',
            condition: [],
            name: token.value,
            body: []
        };
        current++;
        token = tokens[++current];
        if(bodyOpened){
            node.body.push(walk());
        }
        else{
            node.condition.push(walk());
        }
        return node;
      }

      else if (token.type === 'keyword') {
        current++;
        return {
            type: 'Keyword',
            name: token.value,
        };
      }

      else if (token.type === 'curlyBraces') {
        if(token.value === '}'){
            bodyOpened = false;
        }
        current++;
        return ;
      }

      else if (token.type === 'paren') {
        if(token.value === ')'){
            bodyOpened = true;
        }
        current++;
        return ;
      }

      else if (token.type === 'func') {
        let name = tokens[++current].value;
        let opening = tokens[++current];
        let node = {
            type: 'CallExpression',
            name: name,
            params: [],
            body: []
        };
        token = tokens[++current];
        if(opening.value === '{'){
            node.body.push(walk());
        }
        return node;
      }

      throw new TypeError(token.type);
    }
  
    // Now, we're going to create our AST which will have a root which is a
    // `Program` node.
    let ast = {
      type: 'Program',
      body: [],
    };
  
    while (current < tokens.length) {
      ast.body.push(walk());
    }

    return ast;
  }
  
  /**
   * ============================================================================
   *                                 ⌒(❀>◞౪◟<❀)⌒
   *                               THE TRAVERSER!!!
   * ============================================================================
   */
  
  /**
   * So now we have our AST, and we want to be able to visit different nodes with
   * a visitor. We need to be able to call the methods on the visitor whenever we
   * encounter a node with a matching type.
   *
   *   traverse(ast, {
   *     Program: {
   *       enter(node, parent) {
   *         // ...
   *       },
   *       exit(node, parent) {
   *         // ...
   *       },
   *     },
   *
   *     CallExpression: {
   *       enter(node, parent) {
   *         // ...
   *       },
   *       exit(node, parent) {
   *         // ...
   *       },
   *     },
   *
   *     NumberLiteral: {
   *       enter(node, parent) {
   *         // ...
   *       },
   *       exit(node, parent) {
   *         // ...
   *       },
   *     },
   *   });
   */
  
  // So we define a traverser function which accepts an AST and a
  // visitor. Inside we're going to define two functions...
  function traverser(ast, visitor) {
  
    // A `traverseArray` function that will allow us to iterate over an array and
    // call the next function that we will define: `traverseNode`.
    function traverseArray(array, parent) {
      array.forEach(child => {
        traverseNode(child, parent);
      });
    }
  
    // `traverseNode` will accept a `node` and its `parent` node. So that it can
    // pass both to our visitor methods.
    function traverseNode(node, parent) {
  
      // We start by testing for the existence of a method on the visitor with a
      // matching `type`.
      let methods = visitor[node.type];
  
      // If there is an `enter` method for this node type we'll call it with the
      // `node` and its `parent`.
      if (methods && methods.enter) {
        methods.enter(node, parent);
      }
  
      // Next we are going to split things up by the current node type.
      switch (node.type) {
  
        // We'll start with our top level `Program`. Since Program nodes have a
        // property named body that has an array of nodes, we will call
        // `traverseArray` to traverse down into them.
        //
        // (Remember that `traverseArray` will in turn call `traverseNode` so  we
        // are causing the tree to be traversed recursively)
        case 'Program':
          traverseArray(node.body, node);
          break;
  
        // Next we do the same with `CallExpression` and traverse their `params`.
        case 'CallExpression':
          traverseArray(node.params, node);
          break;
  
        // In the cases of `NumberLiteral` and `StringLiteral` we don't have any
        // child nodes to visit, so we'll just break.
        case 'NumberLiteral':
        case 'StringLiteral':
          break;
  
        // And again, if we haven't recognized the node type then we'll throw an
        // error.
        default:
          throw new TypeError(node.type);
      }
  
      // If there is an `exit` method for this node type we'll call it with the
      // `node` and its `parent`.
      if (methods && methods.exit) {
        methods.exit(node, parent);
      }
    }
  
    // Finally we kickstart the traverser by calling `traverseNode` with our ast
    // with no `parent` because the top level of the AST doesn't have a parent.
    traverseNode(ast, null);
  }
  
  /**
   * ============================================================================
   *                                   ⁽(◍˃̵͈̑ᴗ˂̵͈̑)⁽
   *                              THE TRANSFORMER!!!
   * ============================================================================
   */
  
  /**
   * Next up, the transformer. Our transformer is going to take the AST that we
   * have built and pass it to our traverser function with a visitor and will
   * create a new ast.
   *
   * ----------------------------------------------------------------------------
   *   Original AST                     |   Transformed AST
   * ----------------------------------------------------------------------------
   *   {                                |   {
   *     type: 'Program',               |     type: 'Program',
   *     body: [{                       |     body: [{
   *       type: 'CallExpression',      |       type: 'ExpressionStatement',
   *       name: 'add',                 |       expression: {
   *       params: [{                   |         type: 'CallExpression',
   *         type: 'NumberLiteral',     |         callee: {
   *         value: '2'                 |           type: 'Identifier',
   *       }, {                         |           name: 'add'
   *         type: 'CallExpression',    |         },
   *         name: 'subtract',          |         arguments: [{
   *         params: [{                 |           type: 'NumberLiteral',
   *           type: 'NumberLiteral',   |           value: '2'
   *           value: '4'               |         }, {
   *         }, {                       |           type: 'CallExpression',
   *           type: 'NumberLiteral',   |           callee: {
   *           value: '2'               |             type: 'Identifier',
   *         }]                         |             name: 'subtract'
   *       }]                           |           },
   *     }]                             |           arguments: [{
   *   }                                |             type: 'NumberLiteral',
   *                                    |             value: '4'
   * ---------------------------------- |           }, {
   *                                    |             type: 'NumberLiteral',
   *                                    |             value: '2'
   *                                    |           }]
   *  (sorry the other one is longer.)  |         }
   *                                    |       }
   *                                    |     }]
   *                                    |   }
   * ----------------------------------------------------------------------------
   */
  
  // So we have our transformer function which will accept the lisp ast.
  function transformer(ast) {
  
    // We'll create a `newAst` which like our previous AST will have a program
    // node.
    let newAst = {
      type: 'Program',
      body: [],
    };
  
    // Next I'm going to cheat a little and create a bit of a hack. We're going to
    // use a property named `context` on our parent nodes that we're going to push
    // nodes to their parent's `context`. Normally you would have a better
    // abstraction than this, but for our purposes this keeps things simple.
    //
    // Just take note that the context is a reference *from* the old ast *to* the
    // new ast.
    ast._context = newAst.body;
  
    // We'll start by calling the traverser function with our ast and a visitor.
    traverser(ast, {
  
      // The first visitor method accepts any `NumberLiteral`
      NumberLiteral: {
        // We'll visit them on enter.
        enter(node, parent) {
          // We'll create a new node also named `NumberLiteral` that we will push to
          // the parent context.
          parent._context.push({
            type: 'NumberLiteral',
            value: node.value,
          });
        },
      },
  
      // Next we have `StringLiteral`
      StringLiteral: {
        enter(node, parent) {
          parent._context.push({
            type: 'StringLiteral',
            value: node.value,
          });
        },
      },
  
      // Next up, `CallExpression`.
      CallExpression: {
        enter(node, parent) {
  
          // We start creating a new node `CallExpression` with a nested
          // `Identifier`.
          let expression = {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: node.name,
            },
            arguments: [],
          };
  
          // Next we're going to define a new context on the original
          // `CallExpression` node that will reference the `expression`'s arguments
          // so that we can push arguments.
          node._context = expression.arguments;
  
          // Then we're going to check if the parent node is a `CallExpression`.
          // If it is not...
          if (parent.type !== 'CallExpression') {
  
            // We're going to wrap our `CallExpression` node with an
            // `ExpressionStatement`. We do this because the top level
            // `CallExpression` in JavaScript are actually statements.
            expression = {
              type: 'ExpressionStatement',
              expression: expression,
            };
          }
  
          // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
          // `context`.
          parent._context.push(expression);
        },
      }
    });
  
    // At the end of our transformer function we'll return the new ast that we
    // just created.
    return newAst;
  }
  
  /**
   * ============================================================================
   *                               ヾ（〃＾∇＾）ﾉ♪
   *                            THE CODE GENERATOR!!!!
   * ============================================================================
   */
  
  /**
   * Now let's move onto our last phase: The Code Generator.
   *
   * Our code generator is going to recursively call itself to print each node in
   * the tree into one giant string.
   */
  
  function codeGenerator(node) {
  
    // We'll break things down by the `type` of the `node`.
    switch (node.type) {
  
      // If we have a `Program` node. We will map through each node in the `body`
      // and run them through the code generator and join them with a newline.
      case 'Program':
        return node.body.map(codeGenerator)
          .join('\n');
  
      // For `ExpressionStatement` we'll call the code generator on the nested
      // expression and we'll add a semicolon...
      case 'ExpressionStatement':
        return (
          codeGenerator(node.expression) +
          ';' // << (...because we like to code the *correct* way)
        );
  
      // For `CallExpression` we will print the `callee`, add an open
      // parenthesis, we'll map through each node in the `arguments` array and run
      // them through the code generator, joining them with a comma, and then
      // we'll add a closing parenthesis.
      case 'CallExpression':
        return (
          codeGenerator(node.callee) +
          '(' +
          node.arguments.map(codeGenerator)
            .join(', ') +
          ')'
        );
  
      // For `Identifier` we'll just return the `node`'s name.
      case 'Identifier':
        return node.name;
  
      // For `NumberLiteral` we'll just return the `node`'s value.
      case 'NumberLiteral':
        return node.value;
  
      // For `StringLiteral` we'll add quotations around the `node`'s value.
      case 'StringLiteral':
        return '"' + node.value + '"';
  
      // And if we haven't recognized the node, we'll throw an error.
      default:
        throw new TypeError(node.type);
    }
  }
  
  /**
   * ============================================================================
   *                                  (۶* ‘ヮ’)۶”
   *                         !!!!!!!!THE COMPILER!!!!!!!!
   * ============================================================================
   */
  
  /**
   * FINALLY! We'll create our `compiler` function. Here we will link together
   * every part of the pipeline.
   *
   *   1. input  => tokenizer   => tokens
   *   2. tokens => parser      => ast
   *   3. ast    => transformer => newAst
   *   4. newAst => generator   => output
   */
  
  function compiler(input) {
    let tokens = lexer(input);
    console.log(tokens)
    let ast    = parser(tokens);
    // let newAst = transformer(ast);
    // let output = codeGenerator(newAst);
    return ast;
  }
  input = 'func aibol {'+
    'if (1 > 2){'+
        'return 1'+
    '}'+
'}';
input1 = 'if (1 > 2) {'+
    'return 1'+
'}';
  console.log(compiler(input1));
  
  
  