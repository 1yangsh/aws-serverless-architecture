// P141
'use strict';
 
var jwt = require('jsonwebtoken');
 
// generatePolicy 함수를 정의
/* 정책 문서 형식을 생성
    {
        "principalId": "...", 
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "*",
                    "Resource": "*"
                }
            ]
        }
    }
*/
var generatePolicy = function (principalId, effect, resource) {
    var authResponse = {};  // authResponse 객체 선언
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // 정책 문서 형식 버전
        policyDocument.Statement = []; 
 
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
 
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};
 
// 핸들러 함수를 정의
exports.handler = function(event, context, callback) {
    if (!event.authorizationToken) {
        callback('Could not find authorizationToken');
        return;
    }
 
    // JWT 토큰의 앞부분(Bearer)을 제거
    // "authorizationToken": "Bearer eyJhbGciOiJ~~~cCI6IkpXVCJ9.eyJnaXZlbl~~~pKNDQuZSJ9.mioxKcb1~~~W1LTk5_anGo"
    var token = event.authorizationToken.split(' ')[1];
 
    // auth0.com에서 제공한 Client Secret을 환경변수로부터 읽어와서 변수에 할당
    var secretBuffer = new Buffer(process.env.AUTH0_SECRET);
    // JWT 토큰을 검증
    jwt.verify(token, secretBuffer, function(err, decoded) {
        if (err) {
            console.log('Failed jwt verification: ', err, 'auth:', event.authorizationToken);
            callback('Authorization Failed');
        } else {
            var policy = generatePolicy('user', 'allow', event.methodArn);
            console.log(policy);
            callback(null, policy);
        }
    });
};
