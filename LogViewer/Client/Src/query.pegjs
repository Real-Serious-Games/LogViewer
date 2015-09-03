Expr
    = name:PropertyName WS "==" WS value:PropertyValue {
        return function (log) {
                if (moment.isMoment(value)) {
                    return value.isSame(log.Properties[name]);
                }
                else {
                    return log.Properties[name] === value;
                }
        };
    }
    / name:PropertyName WS "!=" WS value:PropertyValue {
        return function (log) {
                if (moment.isMoment(value)) {
                    return !value.isSame(log.Properties[name]);
                }
                else {
                    return log.Properties[name] !== value;
                }
        };
    }
    / name:PropertyName WS ">" WS value:PropertyValue {
        return function (log) {
            if (moment.isMoment(value)) {
                return value.isBefore(log.Properties[name]);
            }
            else {
                return false;
            }
        };
    }
    /name:PropertyName WS "<" WS value:PropertyValue {
        return function (log) {
            if (moment.isMoment(value)) {
                return value.isAfter(log.Properties[name]);
            }
            else {
                return false;
            }
        };
    }
    / text:.* { 
        return function (log) {
            return JSON.stringify(log).indexOf(text.join("")) !== -1;
        };
    }

PropertyValue
    = DateValue
    / StringValue
    / NumberValue

StringValue
    = '"' str:[^"]* '"' { return str.join(""); }
    / "'" str:[^']* "'" { return str.join(""); }

NumberValue
    = num:[0-9]+ { return parseInt(num.join("")); }

DateValue
    = 'Date(' str:[^)]* ')' { 
        var dateStr = str.join("");
        var d = moment(dateStr); 
        if (!d.isValid()) {
            throw new Error("Invalid date: " + dateStr);
        }
        return d;
    }

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


