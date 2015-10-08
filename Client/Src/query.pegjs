LogicExpr
    = firstExpr:EqualityExpr MWS "&&" MWS secondExpr:LogicExpr {
        return function (log) {
            return firstExpr(log) && secondExpr(log);
        };
    }
    / firstExpr:EqualityExpr MWS "||" MWS secondExpr:LogicExpr {
        return function (log) {
            return firstExpr(log) || secondExpr(log);
        };
    }
    / EqualityExpr

EqualityExpr
    = lhs:RelationalExpr MWS "==" MWS rhs:RelationalExpr {
        return function (log) {
                if (rhs(log) && rhs(log).startDate && rhs(log).endDate) {
                    return moment.range(rhs(log).startDate, rhs(log).endDate).contains(moment(lhs(log)), false); //false indicates not to exclude the end date when testing inclusion
                }
                else if (lhs(log) && lhs(log).startDate && lhs(log).endDate) {
                    return moment.range(lhs(log).startDate, lhs(log).endDate).contains(moment(rhs(log)), false); //false indicates not to exclude the end date when testing inclusion
                }
                else {
                    return lhs(log) === rhs(log);
                }
        };
    }
    / lhs:RelationalExpr MWS "!=" MWS rhs:RelationalExpr {
        return function (log) {
                if (rhs(log) && rhs(log).startDate && rhs(log).endDate) {
                    return !moment.range(rhs(log).startDate, rhs(log).endDate).contains(moment(lhs(log)), false); //false indicates not to exclude the end date when testing inclusion
                }
                else if (lhs(log) && lhs(log).startDate && lhs(log).endDate) {
                    return !moment.range(lhs(log).startDate, lhs(log).endDate).contains(moment(rhs(log)), false); //false indicates not to exclude the end date when testing inclusion
                }
                else {
                    return lhs(log) !== rhs(log);
                }
        };
    }    
    / RelationalExpr

RelationalExpr
    = lhs:Unary MWS ">" MWS rhs:Unary {
        return function (log) {
            if (rhs(log) && rhs(log).startDate && rhs(log).endDate) {
                return rhs(log).endDate.isBefore(lhs(log));
            }
            else if (lhs(log) && lhs(log).startDate && lhs(log).endDate) {
                return lhs(log).endDate.isBefore(rhs(log));
            }
            else {
                return false;
            }
        };
    }
    / lhs:Unary MWS "<" MWS rhs:Unary {
        return function (log) {
            if (rhs(log) && rhs(log).startDate && rhs(log).endDate) {
                return rhs(log).startDate.isAfter(lhs(log));
            }
            else if (lhs(log) && lhs(log).startDate && lhs(log).endDate) {
                return lhs(log).startDate.isAfter(rhs(log));
            }
            else {
                return false;
            }
        };
    }
    / Unary

Unary
    = "!" MWS prim:Primary {
        return function (log) {
            return !prim(log); 
        };
    }
    / Primary

Primary
    = "(" MWS expr:LogicExpr MWS ")" { return expr; }
    / value:PropertyValue { 
        return function (log) { 
            return value; 
        }
    }
    / name:PropertyName { 
        return function (log) {
            return log.Properties[name]; 
        } 
    }

PropertyValue
    = DateRangeValue
    / DateValue
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

        var stringArray = dateStr.split(/[\/-]+/);
        var substringCount = stringArray.length;
        var timeUnits;

        switch(substringCount) {
            case 1:
                timeUnits = "year";
                break;
            case 2:
                timeUnits = "month";
                break;
            case 3:
                timeUnits = "day";
                break;
            case 4:
                timeUnits = "minute"
                break;
            default:
                timeUnits = "second"
        }
        var startMoment = moment(dateStr).startOf(timeUnits);
        var endMoment = moment(dateStr).endOf(timeUnits);

        var dates = { startDate: startMoment, endDate: endMoment };
        
        if(!dates.startDate.isValid() || !dates.endDate.isValid()) {
            throw new Error("Invalid date: " + dateStr);
        }

        return dates;
    }

DateRangeValue
    = 'Date(' date1:[^,]* ',' date2:[^)]* ')' {
    var dateStrOne = date1.join("");
    var dateStrTwo = date2.join("");

    var startMoment = moment(dateStrOne);
    var endMoment = moment(dateStrTwo);

    if (!startMoment.isValid()) {
        throw new Error("Invalid date: " + dateStrOne);
    }

    if(!endMoment.isValid()) {
        throw new Error("Invalid date: " + dateStrTwo);
    } 

    if (startMoment > endMoment) {
        var temp = startMoment;
        startMoment = endMoment;
        endMoment = temp;
    }

    return { startDate: startMoment, endDate: endMoment };
}

PropertyName
    = id:Identifier { return id; }

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

MWS
    = WS*

