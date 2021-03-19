// 즉시 실행 함수
(function() {
    // 해당 웹 페이지 문서가 로딩되면 설정 정보를 가져와서 설정
    $(document).ready(function() {
        // user-controller.js에 선언되어 있는 userController 객체의 init 메소드를 호출
        // config.js에 선언되어 있는 configConstants 객체를 인자로 전달
        userController.init(configConstants);
        videoController.init(configConstants);  
        uploadController.init(configConstants);/* 추가 */
    });
})();
