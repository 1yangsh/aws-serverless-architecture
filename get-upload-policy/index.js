// P242
'use strict';
 
var async = require('async');
var crypto = require("crypto-js");
 
// 상수를 정의 
const C_ACL = 'private';    
const C_NOW = new Date().toISOString();                     // 현재 시간 2021-03-19T02:04:38.030Z
const C_DATE_STAMP = C_NOW.slice(0,10).replace(/-/g,'');    // 현재 시간을 YYYYMMDD 형식으로 변환 2021-03-19 => 20210319
const C_REGION_NAME = 'us-east-1';  
const C_SERVICE_NAME = 's3';
const C_X_AMZ_DATE = C_NOW.replace(/[-:\.]/g,'');           // 20210319T020438030Z
const C_X_AMZ_ALGORITHM = 'AWS4-HMAC-SHA256';
const C_X_AMZ_CREDENTIAL = `${process.env.ACCESS_KEY}/${C_DATE_STAMP}/${C_REGION_NAME}/${C_SERVICE_NAME}/aws4_request`;
 
// 반환할 오류 메시지 포맷을 정의해서 반환하는 함수
function createErrorResponse(errCode, errMessage) {
    var response = {
        'statusCode': errCode, 
        'headers': { 'Access-Control-Allow-Origin': '*' }, 
        'body': JSON.stringify({ 'error': errMessage })
    };
    return response;
}
 
// 반환할 성공 메시지 포맷을 정의해서 반환하는 함수
function createSuccessResponse(message) {
    var response = {
        'statusCode': 200, 
        'headers': { 'Access-Control-Allow-Origin': '*' }, 
        'body': JSON.stringify(message)
    };
    return response;
}
 
// expiration(정책 유효 기간)을 계산해서 반환하는 함수
// 다음 날을 ISO 형식으로 반환
// https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/getDate
function generateExpirationDate() {
    var currentDate = new Date();
    currentDate = currentDate.setDate(currentDate.getDate() + 1);
    //                                ~~~~~~~~~~~~~~~~~~~~~~~~~
    //                                현재 일자 + 1 => 다음 날
    return new Date(currentDate).toISOString();
}
 
// 보안정책문서를 생성
function generatePolicyDocument(filename, next) {
    var expiration = generateExpirationDate();              // 정책 유효기간
    var dir = Math.floor(Math.random()*10**16).toString(16);// 디렉터리 명으로 사용할 난수를 생성
    var key = dir + '/' + filename;                         // 키 이름을 설정
    // https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html
    var policy = {
        'expiration': expiration,
        'conditions': [                                 
            { acl: `${C_ACL}` },                     
            { bucket: process.env.UPLOAD_BUCKET },
            [ 'starts-with', '$key', `${dir}/` ],           // 키 이름이 ${dir}/ 형식으로 시작해야 함
            { 'x-amz-algorithm': `${C_X_AMZ_ALGORITHM}`},
            { 'x-amz-credential': `${C_X_AMZ_CREDENTIAL}` },
            { 'x-amz-date': `${C_X_AMZ_DATE}` }
        ]
    };
    next(null, key, policy);                                // waterfall 함수에 따라 encode 함수가 호출
}
 
// 보안정책문서의 포맷을 변경 : 문자열 -> JSON -> 개행문자를 제거 -> BASE64로 인코딩
function encode(key, policy, next) {
    var json = JSON.stringify(policy).replace('\n', '');
    //         ~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~
    //         JSON 형식으로 변환      개행문자를 제거
    var encodedPolicy = new Buffer(json).toString('base64');
    //                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                  BASE64로 인코딩 
    next(null, key, encodedPolicy);                         // waterfall 함수에 따라 sign 함수를 호출
}
 
// 서명 키를 생성
// https://docs.aws.amazon.com/ko_kr/general/latest/gr/signature-v4-examples.html
function getSigningKey() {
    var dateKey              = crypto.HmacSHA256(C_DATE_STAMP  , "AWS4" + process.env.SECRET_ACCESS_KEY);
    var dateRegionKey        = crypto.HmacSHA256(C_REGION_NAME , dateKey);
    var dateRegionServiceKey = crypto.HmacSHA256(C_SERVICE_NAME, dateRegionKey);
    var signingKey           = crypto.HmacSHA256("aws4_request", dateRegionServiceKey);
    return signingKey;
}
 
// 서명을 생성
// https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html
function sign(key, encodedPolicy, next) {
    var signingKey = getSigningKey();
    var signature = crypto.HmacSHA256(encodedPolicy, signingKey);
    next(null, key, encodedPolicy, signature);
}
 
exports.handler = function(event, context, callback) {
    var filename = null;
    if (event.queryStringParameters && event.queryStringParameters.filename) {
        filename = decodeURIComponent(event.queryStringParameters.filename);     
    } else {
        callback(null, createErrorResponse(500, '파일명이 누락되었습니다.'));
        return;
    }
 
    async.waterfall([ async.apply(generatePolicyDocument, filename), encode, sign ], function (err, key, encoded_policy, signature) {
        if (err) {
            callback(null, createErrorResponse(500, err));
        } else {
            var result = {
                upload_url: process.env.UPLOAD_URI,
                encoded_policy: encoded_policy, 
                key: key, 
                acl: `${C_ACL}`,
                x_amz_algorithm: `${C_X_AMZ_ALGORITHM}`, 
                x_amz_credential: `${C_X_AMZ_CREDENTIAL}`, 
                x_amz_date: `${C_X_AMZ_DATE}`,
                x_amz_signature: `${signature}`
            };
            callback(null, createSuccessResponse(result));
        }
    });
}
