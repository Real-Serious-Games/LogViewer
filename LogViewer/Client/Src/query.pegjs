Expr
  = name:PropertyName WS "==" WS value:PropertyValue {
    return function (log) {
        return log.Properties[name] === value;
    };
  }
  / name:PropertyName WS "!=" WS value:PropertyValue {
    return function (log) {
        return log.Properties[name] !== value;
    };
  }
  / text:.* { 
    return function (log) {
      return JSON.stringify(log).indexOf(text.join("")) !== -1;
    };
  }

PropertyValue
  = StringValue
  / NumberValue

StringValue
  = '"' str:[^"]* '"' { return str.join(""); }
  / "'" str:[^"]* "'" { return str.join(""); }

NumberValue
  = num:[0-9]+ { return parseInt(num.join("")); }

PropertyName
  = "$" id:Identifier { return id; }

Identifier
  = first:IdentifierStart rest:IdentifierPart* {
    return first + rest.join("");
  }

IdentifierStart
  = [a-z]
  / [A-Z]
  / "$"
  / "_"

IdentifierPart
  = IdentifierStart
  / [0-9]

WS
  = "\t"
  / " "
