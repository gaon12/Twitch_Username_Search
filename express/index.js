const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv'); // 환경변수
const morgan = require('morgan'); // 로깅
const axios = require('axios');

dotenv.config();

const app = express();
app.set('port', process.env.NODE_PORT);
app.use(cors('*'));
app.use(bodyParser.json()); // JSON 파싱
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

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
        
        let channelId = [];

        for (const channel of channels) {
            channelId.push(channel.id);
        }

        let streamer = null; // 파트너 스트리머를 담을 변수

        for (let i = 0; i < channelId.length; i++) {           
            let userLogin = channelId[i];
            const endpoint = `https://api.twitch.tv/helix/users?id=${userLogin}`;
            try {
                const userResponse = await axios.get(endpoint, {headers});
                const userData = userResponse.data.data[0];
                if (userData.broadcaster_type === 'partner') {
                    streamer = userData.login;
                    break; // 파트너 스트리머를 찾으면 반복문 종료
                } else if (!streamer) {
                    // 파트너 스트리머가 없을 경우, 첫 번째로 조회된 유저를 저장
                    streamer = userData.login;
                }
            } catch (error) {
                console.error('Twitch API 호출 중 오류 발생:', error);
            }
        }

        return streamer; // 파트너 스트리머 또는 첫 번째로 조회된 유저를 반환
    } catch (error) {
        console.error("에러 발생: ", error);
        return "에러 발생";
    }
}

app.post('/', async (req, res) => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const channelName = req.body.channelName;
    const streamer = await getTwitchChannelUrl(clientId, clientSecret, channelName);

    return res.json({
        "id": streamer
    })
});

app.listen(process.env.NODE_PORT, () => {
    console.log('start');
})