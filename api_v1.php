<?php
// Twitch API credentials
$clientID = 'CLIENT_ID_HERE';
$clientSecret = 'CLIENT_SECRET_HERE';

function getOAuthToken($clientID, $clientSecret) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://id.twitch.tv/oauth2/token');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'client_id=' . $clientID . '&client_secret=' . $clientSecret . '&grant_type=client_credentials');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);  // 10초 후에 타임아웃
    $tokenResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode != 200) {
        $error_message = json_decode($tokenResponse, true)['message'];
        return array('StatusCode' => $httpCode, 'message' => $error_message);
    }

    $tokenData = json_decode($tokenResponse, true);
    return $tokenData['access_token'];
}

function searchChannels($clientID, $accessToken, $channelName, $pageNo) {
    $ch = curl_init();
    $offset = ($pageNo - 1) * 10;  // Calculate offset based on page number
    $searchURL = 'https://api.twitch.tv/helix/search/channels?query=' . urlencode($channelName) . '&first=10&offset=' . $offset;
    curl_setopt($ch, CURLOPT_URL, $searchURL);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Client-ID: ' . $clientID,
        'Authorization: Bearer ' . $accessToken
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);  // 타임아웃 설정
    $searchResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode != 200) {
        $error_message = json_decode($searchResponse, true)['message'];
        return array('StatusCode' => $httpCode, 'message' => $error_message);
    }

    $searchData = json_decode($searchResponse, true);
    return $searchData;  // Return entire data including total number of channels and channel data
}

function getAdditionalInfo($clientID, $accessToken, $channelIDs) {
    $mh = curl_multi_init();
    
    $handles = array();
    foreach ($channelIDs as $channelID) {
        // Get user info
        $ch1 = curl_init();
        $usersURL = 'https://api.twitch.tv/helix/users?id=' . urlencode($channelID);
        curl_setopt($ch1, CURLOPT_URL, $usersURL);
        curl_setopt($ch1, CURLOPT_HTTPHEADER, array(
            'Client-ID: ' . $clientID,
            'Authorization: Bearer ' . $accessToken
        ));
        curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
        curl_multi_add_handle($mh, $ch1);
        
        // Get stream info
        $ch2 = curl_init();
        $streamsURL = 'https://api.twitch.tv/helix/streams?user_id=' . urlencode($channelID);
        curl_setopt($ch2, CURLOPT_URL, $streamsURL);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, array(
            'Client-ID: ' . $clientID,
            'Authorization: Bearer ' . $accessToken
        ));
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_multi_add_handle($mh, $ch2);
        
        $handles[$channelID] = array($ch1, $ch2);
    }
    
    $running = null;
    do {
        curl_multi_exec($mh, $running);
    } while ($running);
    
    $additionalInfo = array();
    foreach ($handles as $channelID => $handleArray) {
        $usersResponse = curl_multi_getcontent($handleArray[0]);
        $streamsResponse = curl_multi_getcontent($handleArray[1]);
        
        $usersData = json_decode($usersResponse, true);
        $streamsData = json_decode($streamsResponse, true);
        
        $userInfo = $usersData['data'][0];
        $isPartnered = $userInfo['broadcaster_type'] === 'partner';
        $isLive = !empty($streamsData['data']);
        
        $additionalInfo[$channelID] = array(
            'Followers' => $userInfo['view_count'],
            'Broadcasting' => $isLive,
            'Partner' => $isPartnered
        );
        
        curl_multi_remove_handle($mh, $handleArray[0]);
        curl_multi_remove_handle($mh, $handleArray[1]);
    }
    
    curl_multi_close($mh);
    
    return $additionalInfo;
}

$accessToken = getOAuthToken($clientID, $clientSecret);
if (is_array($accessToken)) {
    echo json_encode($accessToken);
    exit();
}

$inputData = json_decode(file_get_contents('php://input'), true);
$channelName = $inputData['SearchValue'];
$pageNo = isset($inputData['pageno']) ? $inputData['pageno'] : 1;  // Set page number, default is 1

$searchData = searchChannels($clientID, $accessToken, $channelName, $pageNo);

if (empty($searchData['data'])) {
    echo json_encode(array('StatusCode' => 404, 'message' => 'No channels found'));
    exit();
}

$responseData = array(
    'StatusCode' => 200,
    'message' => 'Success',
    'data' => array()
);

$channelIDs = array_column($searchData['data'], 'id');
$allAdditionalInfo = getAdditionalInfo($clientID, $accessToken, $channelIDs);

foreach ($searchData['data'] as $channel) {
    $channelID = $channel['id'];
    $additionalInfo = $allAdditionalInfo[$channelID];

    $channelData = array(
        'Nickname' => $channel['display_name'],
        'ID' => $channel['broadcaster_login'],
        'UniqueNumber' => $channel['id'],
        'Icon' => $channel['thumbnail_url'],
        'Followers' => $additionalInfo['Followers'],
        'Broadcasting' => $additionalInfo['Broadcasting'],
        'Partner' => $additionalInfo['Partner']
    );

    array_push($responseData['data'], $channelData);
}

echo json_encode($responseData);

?>
