import requests

def get_twitch_channel_url(client_id, client_secret, channel_name):
    oauth_url = "https://id.twitch.tv/oauth2/token"
    oauth_params = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials"
    }

    # 토큰 받기
    response = requests.post(oauth_url, params=oauth_params)
    response_data = response.json()
    access_token = response_data.get('access_token')
    
    if not access_token:
        return "토큰을 받지 못했습니다."

    # 채널 정보 검색
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {access_token}"
    }
    search_url = f"https://api.twitch.tv/helix/search/channels?query={channel_name}"
    response = requests.get(search_url, headers=headers)
    channels = response.json().get('data', [])

    for channel in channels:
        if channel.get('display_name').lower() == channel_name.lower():
            return f"https://www.twitch.tv/{channel.get('broadcaster_login')}"

    return "채널을 찾을 수 없습니다."

# 여기에 클라이언트 ID와 클라이언트 시크릿을 입력하세요.
client_id = "CLIENT_ID_HERE"
client_secret = "CLIENT_SECRET_HERE"

# 채널명을 입력하세요.
channel_name = "인간젤리"

# URL 가져오기
channel_url = get_twitch_channel_url(client_id, client_secret, channel_name).split('/')[-1]

print("닉네임: " + channel_name)
print("유저네임: " + channel_url)
