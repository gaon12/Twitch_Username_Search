# Twitch_Username_Search
트위치 닉네임으로 유저네임 검색을 할 수 있어요!

# 멀티 스트리밍 사이트 시범 운영중!
현재 시범 운영중이에요. [https://mt.uiharu.dev](https://mt.uiharu.dev) 에서 확인하시고, 오류나 개선사항이 있으면 언제나 알려주세요!

# 준비물
트위치 개발자 페이지로 가서 응용프로그램 생성 후, `클라이언트 ID`, `클라이언트 시크릿`을 발급받아 코드에 입력합니다.

# 언어
## 파이썬
* `파이썬 3.10` 버전에서 개발되었습니다.
* `requests` 라이브러리가 설치되어 있어야 합니다. 아래의 명령어로 설치할 수 있습니다.

```
pip install requests
```

또는

```
pip3 install requests
```

## Node.js
* `Node.js 18` 버전대에서 개발되었습니다.
* `axios` 라이브러리가 설치되어 있어야 합니다. 아래의 명령어로 설치할 수 있습니다.

```
npm install axios
```

## PHP
* `PHP 8.1` 버전대에서 개발되었습니다.

### 사용 방법
* POST로 다음 형식에 맞게 요청을 보내야 합니다.
```JSON
{
	"SearchType": "nickname",
	"SearchValue": "{{닉네임}}"
}
```

예:
```JSON
{
	"SearchType": "nickname",
	"SearchValue": "김블루"
}
```

* 응답은 다음의 형태로 옵니다.
```JSON
{
	"StatusCode": 200,
	"message": "Success",
	"data": [
		{
			"Nickname": "{{닉네임}}",
			"ID": "{{아이디}}",
			"UniqueNumber": "{{고유 번호}}",
			"Icon": "{{프로필 이미지}}",
			"URL": "{{채널 주소}}",
			"Broadcasting": {{방송 여부}},
			"Partner": {{트위치 파트너 여부}}
		}
    ]
}
```

예:
```JSON
{
	"StatusCode": 200,
	"message": "Success",
	"data": [
		{
			"Nickname": "고세구___",
			"ID": "gosegugosegu",
			"UniqueNumber": "707328484",
			"Icon": "https:\/\/static-cdn.jtvnw.net\/jtv_user_pictures\/1e4cac72-a1cd-4f72-8ada-b2d10ac990d7-profile_image-300x300.png",
			"URL": "https:\/\/www.twitch.tv\/gosegugosegu",
			"Broadcasting": true,
			"Partner": true
		}
    ]
}
```

실제로는 입력한 닉네임이 들어간 모든 닉네임을 검색하기 때문에, 여러개가 나옵니다. 또한 이 결과는 `api_v2.php` 기준이며, `api_v1.php`는 팔로워 수도 나옵니다.

### 존재하지 않는 닉네임
존재하지 않는 닉네임 검색 시 다음과 같이 나옵니다.
```JSON
{
	"StatusCode": 404,
	"message": "No channels found"
}
```

### api_v1.php와 api_v2.php의 차이점
* `api_v1.php`은 닉네임, 아이디, 고유 번호, 프로필 이미지, 채널 주소, 방송 여부, 트위치 파트너 여부, 팔로워 수가 나오며, `api_v2.php`는 `api_v1.php`에서 팔로워 수는 나오지 않지만 속도가 약 3배 더 빠릅니다.
* ~~추후 `api_v2.php`에 팔로워 수를 추가할 예정입니다.~~ 트위치 API에서 팔로워 수는 한꺼번에 검색할 수 없어서 너무 느려 제거합니다.
