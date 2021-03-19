var uploadController = {
    data: {
        config: null
    }, 
    uiElements: {
        uploadButton: null
    }, 
    init: function(configConstants) {
        this.data.config = configConstants;
        this.uiElements.uploadButton = $('#upload');
        this.uiElements.uploadButtonContainer = $('#upload-video-button');
        this.uiElements.uploadProgressBar = $('#upload-progress');
        this.wireEvents();
    }, 
    wireEvents: function() {
        var that = this;
 
        // 파일 선택창의 내용이 변경된 경우 수행할 기능을 정의
        this.uiElements.uploadButton.on('change', function(result) {
            // 선택한 파일 정보를 가져와서 변수에 할당
            // file = {name: "수행평가 - 1조.pdf", lastModified: 1616109336996, lastModifiedDate: Fri Mar 19 2021 08:15:36 GMT+0900 (대한민국 표준시), webkitRelativePath: "", size: 5272297, …}
            var file = $('#upload').get(0).files[0];
            // 24-hour-video API의 s3-policy-document 리소스에 filename 파라미터의 값으로 선택한 파일의 이름을 전달
            var requstDocumentUrl = that.data.config.getUploadPolicyApiUrl + '/s3-policy-document?filename=' + encodeURI(file.name);
            $.get(requstDocumentUrl, function(data, status) {
                // file: 선택한 파일 정보
                // data: get-upload-policy 람다 함수의 실행 결과 = S3 버킷 업로드 정책 문서 
                that.upload(file, data, that);
            });
        });
    }, 
    // 파일 선택창에서 선택한 파일을 S3 버킷으로 업로드 
    upload: function(file, data, that) {
        // 파일 선택창을 숨기고, 진행률 창을 보이게 처리
        this.uiElements.uploadButtonContainer.hide();
        this.uiElements.uploadProgressBar.show();
        this.uiElements.uploadProgressBar.find('.progress-bar').css('width', '0');
 
        // 요청 본문을 생성
        var fd = new FormData();
        fd.append('key', data.key);
        fd.append('policy', data.encoded_policy);
        fd.append('acl', data.acl);
        fd.append('x-amz-algorithm', data.x_amz_algorithm);
        fd.append('x-amz-credential', data.x_amz_credential);
        fd.append('x-amz-date', data.x_amz_date);
        fd.append('x-amz-signature', data.x_amz_signature);
        fd.append('file', file, file.name);        
        $.ajax({
            url: data.upload_url,
            type: 'POST', 
            data: fd, 
            processData: false,
            contentType: false, 
            xhr: this.progress,
            // ajax 요청을 전달하기 전에 수행해야 할 작업을 명시
            // Authorization 요청 헤더의 값을 제거
            beforeSend: function(req) {
                req.setRequestHeader('Authorization', '');
            }
        })
        // 업로드에 성공한 경우 수행할 내용
        .done(function(response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            alert('업로드 성공');
        })
        // 업로드에 실패한 경우 수행할 내용
        .fail(function(response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            console.error(response);
            alert('업로드 실패');
        })
    }, 
    // 진행율을 표시
    progress: function() {
        var xhr = $.ajaxSettings.xhr();
        xhr.upload.onprogress = function(evt) {
            var percentage = evt.loaded / evt.total * 100;
            $('#upload-progress').find('.progress-bar').css('width', percentage + '%');
        };
        return xhr;
    }
}
