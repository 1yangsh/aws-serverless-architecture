// P130
// AWS 람다 서비스를 통해서 실행되는 코드
'use strict';
 
// https://www.npmjs.com/package/jsonwebtoken
// https://www.npmjs.com/package/request
var jwt = require('jsonwebtoken');
var request = require('request');
 
/*
event = {
  "accessToken": "w7agqIkUzCofd9nUelOxgd1zogqPpw9V",
  "authToken": "Bearer eyJhbGciOiJ~~~cCI6IkpXVCJ9.eyJnaXZlbl~~~pKNDQuZSJ9.mioxKcb1~~~W1LTk5_anGo"
};
*/
exports.handler = function (event, context, callback) {
    console.log(JSON.stringify(event));
 
    // event 객체에 authToken, accessToken 존재 여부를 확인
    // 만약, 존재하지 않으면 리턴
    if (!event.authToken) {
        callback('Could not find authToken');
        return;
    }
    if (!event.accessToken) {
        callback('Could not find access_token');
        return;
    }
    
    // authToken의 값을 공백문자를 기준으로 분리한 후 두번째 값을 id_token 변수에 할당
    // authToken은 Bearer 값.값.값 형식을 가짐
    var id_token = event.authToken.split(' ')[1];
    var access_token = event.accessToken;
    var body = {
        'id_token': id_token,
        'access_token': access_token
    };
 
    // 환경변수 DOMAIN의 값은 auth0.com에 설정되어 있는 어플리케이션의 도메인
    // auth0.com에 사용자 프로필 정보 조회에 필요한 값을 설정
    // ==> 로그인 시 전달받은 access token을 요청 파라미터로 전달
    // https://auth0.com/docs/api/authentication#user-profile
    var options = {
        url: 'https://' + process.env.DOMAIN + '/userinfo',
        method: 'GET',
        json: true,
        body: body
    };
 
    // auth0.com으로 사용자 프로필 정보를 조회
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // 정상적으로 조회한 경우 호출한 곳으로 프로필 정보를 반환
            callback(null, body);
        } else {
            callback(error);
        }
    });
};
