'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

exports.handler = function(event, context, callback) {
    // 이벤트 객체에서 동영상이 저장된 버킷과 이름(키)을 추출
    var message = JSON.parse(event.Records[0].Sns.Message);
    var sourceBucket = message.Records[0].s3.bucket.name;
    var sourceKey = message.Records[0].s3.object.key;
    sourceKey = decodeURIComponent(sourceKey.replace(/\+/g, ' '));

    // 동영상의 접근제어목록(ACL) 속성을 public-read로 설정 -> 외부에서 접근 가능
    var params = {
        Bucket: sourceBucket,
        Key: sourceKey,
        ACL: "public-read"
    }
    s3.putObjectAcl(params, function(err, data) {
        if (err) {
            callback(err);
        }
    })
};
