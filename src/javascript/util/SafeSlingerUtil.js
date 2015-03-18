SafeSlinger.util = {};

SafeSlinger.util.parseHexString = function (str){
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
    }

    return result;
};

SafeSlinger.util.createHexString = function (arr) {
    var result = "";
    var z;

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);

        z = 2 - str.length + 1;
        str = Array(z).join("0") + str;

        result += str;
    }

    return result;
};

SafeSlinger.util.createBinString = function (arr) {
    var retStr = "";
    for(var i=0;i<arr.length; i++){
        retStr = retStr + String.fromCharCode(arr[i]);
    }
    return retStr;
};