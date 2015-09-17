Expr
    = name:PropertyName WS "==" WS value:PropertyValue {
        return function (log) {
                if (value.startDate && value.endDate) {
                    return moment.range(value.startDate, value.endDate).contains(moment(log.Properties[name]), false); //false indicates not to exclude the end date when testing inclusion
                }
                else {
                    return log.Properties[name] === value;
                }
        };
    }
    / name:PropertyName WS "!=" WS value:PropertyValue {
        return function (log) {
                if (value.startDate && value.endDate) {
                    return !moment.range(value.startDate, value.endDate).contains(moment(log.Properties[name]), false);
                }
                else {
                    return log.Properties[name] !== value;
                }
        };
    }
    / name:PropertyName WS ">" WS value:PropertyValue {
        return function (log) {
            if (value.startDate && value.endDate) {
                return value.endDate.isBefore(log.Properties[name]);
            }
            else {
                return false;
            }
        };
    }
    /name:PropertyName WS "<" WS value:PropertyValue {
        return function (log) {
            if (value.startDate && value.endDate) {
                return value.startDate.isAfter(log.Properties[name]);
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


