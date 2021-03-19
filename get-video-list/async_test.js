// https://caolan.github.io/async/v3/docs.html#waterfall
 
var async = require("async");
 
async.waterfall([
    function(firstcallbackfunc) {
        console.log(`첫번째 함수`);
        firstcallbackfunc(null, "Peter", "Sam");
    }, 
    function(a1, a2, secondcallbackfunc) {
        console.log(`두번째 함수 ${a1}, ${a2}`);
        secondcallbackfunc(null, "Serverless");
    }, 
    function(a3, thirdcallbackfunc) {
        console.log(`세번째 함수 ${a3}`);
        thirdcallbackfunc(null, "Done")
    }
], function(err, result) {
    console.log(`최종 콜백 ${err}, ${result}`);
});
