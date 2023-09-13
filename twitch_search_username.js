const axios = require('axios');

async function getTwitchChannelUrl(clientId, clientSecret, channelName) {
  const oauthUrl = 'https://id.twitch.tv/oauth2/token';
  const oauthParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  });

  try {
    // 토큰 받기
    const tokenResponse = await axios.post(oauthUrl, oauthParams);
    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return "토큰을 받지 못했습니다.";
    }

    // 채널 정보 검색
    const headers = {
      "Client-ID": clientId,
      "Authorization": `Bearer ${accessToken}`
    };
    const searchUrl = `https://api.twitch.tv/helix/search/channels?query=${channelName}`;
    const response = await axios.get(searchUrl, { headers });
    const channels = response.data.data;

    for (const channel of channels) {
      if (channel.display_name.toLowerCase() === channelName.toLowerCase()) {
        const urlSegment = `https://www.twitch.tv/${channel.broadcaster_login}`.split('/');
        const username = urlSegment[urlSegment.length - 1];

        console.log("닉네임: " + channelName);
        console.log("유저네임: " + username);
        
        return;
      }
    }

    console.log("채널을 찾을 수 없습니다.");
  } catch (error) {
    console.error("에러 발생: ", error);
  }
}

// 여기에 클라이언트 ID와 클라이언트 시크릿을 입력하세요.
const clientId = "CLIENT_ID_HERE";
const clientSecret = "CLIENT_SECRET_HERE";

// 채널명을 입력하세요.
const channelName = "인간젤리";

// URL 가져오기
getTwitchChannelUrl(clientId, clientSecret, channelName);
