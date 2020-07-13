export default class SgfParser {
  constructor(insgf) {
    this.sgf = insgf;
    this.index = 0;
    this.root = {
      _children: []
    };
    this.parseTree(this.root);
  }

  getSGFResult = function () {
    return this.root;
  };

  parseTree(curnode) {
    while (this.index < this.sgf.length) {
      var c = this.curChar();
      this.index++;

      switch (c) {
        case ';':
          curnode = this.parseNode(curnode);
          break;

        case '(':
          this.parseTree(curnode);
          break;

        case ')':
          return;
          break;
      }
    }
  }

  parseNode(parent) {
    var node = {
      _children: []
    };
    if (parent) parent._children.push(node);else this.root = node;
    node._parent = parent;
    node = this.parseProperties(node);
    return node;
  }

  parseProperties(node) {
    var key = "";
    var values = [];
    var i = 0;

    while (this.index < this.sgf.length) {
      var c = this.curChar();

      if (c == ';' || c == '(' || c == ')') {
        break;
      }

      if (this.curChar() == '[') {
        while (this.curChar() == '[') {
          this.index++;
          values[i] = "";

          while (this.curChar() != ']' && this.index < this.sgf.length) {
            if (this.curChar() == '\\') {
              this.index++; // not technically correct, but works in practice

              while (this.curChar() == "\r" || this.curChar() == "\n") {
                this.index++;
              }
            }

            values[i] += this.curChar();
            this.index++;
          }

          i++;

          while (this.curChar() == ']' || this.curChar() == "\n" || this.curChar() == "\r") {
            this.index++;
          }
        }

        if (node[key]) {
          if (!(node[key] instanceof Array)) {
            node[key] = [node[key]];
          }

          node[key] = node[key].concat(values);
        } else {
          node[key] = values.length > 1 ? values : values[0];
        }

        key = "";
        values = [];
        i = 0;
        continue;
      }

      if (c != " " && c != "\n" && c != "\r" && c != "\t") {
        key += c;
      }

      this.index++;
    }

    return node;
  }

  curChar() {
    return this.sgf.charAt(this.index);
  }

}