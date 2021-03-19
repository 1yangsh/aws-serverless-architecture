// P51
'use strict';
var AWS = require('aws-sdk');

var elasticTranscoder = new AWS.ElasticTranscoder({
    region: 'us-east-1'
});

exports.handler = function(event, context, callback) {
    console.log('Welcome');
 
    // https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/with-s3.html
    // S3 버킷에 저장된 파일명(=객체명)을 가져옴
    var key = event.Records[0].s3.object.key;   
    // 파일 이름에서 "+" 기호를 " " 문자로 대체하고 URL 디코딩
    // ==> URL 인코딩되었던 파일명을 원본 형태로 변경
    var sourceKey = decodeURIComponent(key.replace(/\+/g, ' '));
    // 확장자를 제거 ==> 파일의 이름 부분만 추출 
    var outputKey = sourceKey.split('.')[0];
    // Elastic Transcoder의 파이프라인에 전달하는 값(인자)
    var params = {
        PipelineId: '1615427970749-j6u8b9',     // 본인의 것으로 변경
        Input: {
            Key: sourceKey                      // S3 버킷의 객체명(파일명)
        },
        Outputs: [
            {
                // 트랜스코딩된 결과 파일명 ==> 원본파일이름/원본파일이름-프리셋.mp4
                Key: outputKey + '/' + outputKey + '-1080p' + '.mp4', 
                // 미리 정의되어 있는 동영상 포맷
                // https://docs.aws.amazon.com/ko_kr/elastictranscoder/latest/developerguide/system-presets.html
                // 일반 1080p
                PresetId: '1351620000001-000001' 
            },
            {
                Key: outputKey + '/' + outputKey + '-720p' + '.mp4',
                // 일반 720p
                PresetId: '1351620000001-000010' 
            },
            {
                Key: outputKey + '/' + outputKey + '-web-720p' + '.mp4',
                // 웹: Facebook, SmugMug, Vimeo, YouTube
                PresetId: '1351620000001-100070' 
            }
        ]};
 
    //                          인자  , 트랜스코딩이 끝났을 때 호출할 콜백 함수
    elasticTranscoder.createJob(params, function(error, data) {
        if (error) {
            // 트랜스코딩 과정에서 오류가 발생하면 핸들러 함수를 호출한 곳으로 오류를 반환
            callback(error);
        }
    });
};
