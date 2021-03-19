// 필요 모듈 추가 및 S3 객체 생성
var AWS = require('aws-sdk');
var async = require('async');
var s3 = new AWS.S3();
 
// next : callback 함수
// next(ERROR, DATAS, ...)
// next(null, ...) ==> 오류가 발생하지 않았으며, 어떤 값을 반환
// next(어떤값)    ==> callback 함수로 오류를 반환
 
// S3.listObjects 함수 호출에 사용할 입력 포맷을 생성
function createBucketParams(next) {
    var params = {
        Bucket: process.env.BUCKET,
        EncodingType: 'url'
    };
    next(null, params); // #1 함수가 호출
}
 
// #1 버킷의 객체(파일) 목록을 조회
function getVideosFromBucket(params, next) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
    s3.listObjects(params, function(err, data) {
        if (err) {
            next(err);
        } else {
            next(null, data); // #2 함수가 호출
        }
    });
}
 
// #2 버킷의 객체 목록 조회 결과를 반환 형식에 맞춰서 변형
function createList(data, next) {
    console.log(data); 
 
    // 버킷의 객체 이름(폴더명과 확장자를 포함)을 저장할 배열
    var urls = [];
    for (var i = 0; i < data.Contents.length; i ++) {
        var file = data.Contents[i];
        // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/String/substr
        // 키(객체 이름)의 마지막 세글자가 mp4인 경우 
        if (file.Key && file.Key.substr(-3, 3) === 'mp4') {
            urls.push(file);
        }
    }
 
    var result = {
        baseUrl: process.env.BASE_URL,  // 버킷 접근 URL
        bucket: process.env.BUCKET,
        urls: urls
    };
 
    next(null, result); // #3 함수로 전달
}
 
exports.handler = function(event, context, callback) {
    async.waterfall([ 
        createBucketParams, 
        getVideosFromBucket, 
        createList
    ], 
    // #3 함수 : [ ... ]에 정의된 함수가 모두 정상 수행 또는 오류가 발생한 경우에 호출
    function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result); // 버킷에 저장된 객체 목록을 버킷 접속 주소, 버킷 ARN과 함께 반환
        }
    });
};
