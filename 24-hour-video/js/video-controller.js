// P209
var videoController = {
    data: {
        config: null
    },
    uiElements: {
        videoCardTemplate: null, 
        videoList: null
    }, 
    init: function(config) {
        // index.html 문서에 id 속성이 video-template, video-list인 요소를 참조
        this.uiElements.videoCardTemplate = $('#video-template');
        this.uiElements.videoList = $('#video-list');
 
        // config.js 파일에 있는 내용을 참조
        this.data.config = config;
 
        this.getVideoList();
        this.wireEvents(); 
    }, 
    // get-video-list API를 호출
    getVideoList: function() {
        var that = this;
 
        // get-video-list API 호출 URL + 리소스 이름
        // videos 리소스를 GET 방식으로 호출 --> get-video-list 람다 함수를 실행하고 결과를 반환 받음
        var url = this.data.config.getFileListApiUrl + '/videos';
        $.get(url, function(data, status) {
            that.updateVideoFrontPage(data);
        });
    }, 
    // get-video-list 람다 함수의 실행 결과를 목록으로 화면에 출력
    updateVideoFrontPage: function(data) {
        console.log(data);
        // <ul id="video-list">
        // <li url="https://serverless-videotranscoded-myanjini.s3.amazonaws.com/my+video/my+video-1080p.mp4">동영상 파일명</li>
        //          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~~~~~
        //          baseUrl                                                      urls.Key                     urls.Key에서 파일명만 추출
        var baseUrl = data.baseUrl;
        var urls = data.urls;
 
        /*
        for (var i = 0; i < urls.length; i ++) {
            var url = urls[i];
            var key = url.Key;
            var filename = key.split('/')[1];
            var litag = '<li url="' + baseUrl + '/' + key + '">' + filename + '</li>';
            $('#video-list').append(litag);
        }
        */
 
        urls.forEach(url => {
            var key = url.Key;
            var filename = key.split('/')[1];
            var litag = `<li url="${baseUrl}/${key}">${filename}</li>`; 
            $('#video-list').append(litag);
        });
    }, 
 
    // 추가된 부분 시작
    // 이벤트를 처리하는 함수(이벤트 핸들러)를 정의
    // https://developer.mozilla.org/ko/docs/Web/HTML/Element/Video
    wireEvents: function() {
        // id 속성(attibute) 값이 video-list인 요소(element, tag) 아래에서 
        // li 요소에 click 이벤트가 발생했을 때 수행할 동작을 정의
        $('#video-list').on('click', 'li', function() {
            // 클릭한 li 태그(요소)의 url 속성의 값을 가져와서 url 변수에 할당
            var url = $(this).attr('url');
            /*
            <video width="100%" height="100%" controls>
              <!-- video 태그에 사용될 동영상의 소스 -->
              <!-- src 속성에 동영상의 주소를 추가하면 재생이 가능 -->
              <source type="video/mp4">
              지원하지 않는 타입
            </video>
            */
            // source 태그(요소)의 src 속성의 값으로 url 변수의 값을 설정
            $('source').attr('src', url);
            // video 태그(요소)에 설정된 동영상 파일을 읽어들림
            $('video').load();
        });
    }
    // 추가된 부분 끝
};
