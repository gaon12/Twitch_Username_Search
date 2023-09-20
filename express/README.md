# API 활용 예시
## overview
트위치 스트리머 닉네임을 검색하면 아이디를 반환해주는 API를 활용.       
파트너 스트리머를 우선으로 반환하고 파트너 스트리머가 없다면 가장 먼저 조회된 유저를 반환

## requirement
.env 파일 (루트 디렉토리에 추가)
```shell
    NODE_PORT=포트번호
    CLIENT_ID=클라이언트아이디
    CLIENT_SECRET=클라이언트시크릿
```

## request
POST 요청
```JSON
    {
	    "channelName": "닉네임"
    }
```

## response
JSON 반환
```JSON
    {
	    "id": "아이디"
    }   
```
if 없는 유저 조회
```JSON
    {
	    "id": null
    }
```