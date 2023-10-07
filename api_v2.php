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

function searchChannels($clientID, $accessToken, $channelName) {
    $ch = curl_init();
    $searchURL = 'https://api.twitch.tv/helix/search/channels?query=' . urlencode($channelName);
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

function getPartnerStatuses($clientID, $accessToken, $userIDs) {
    $ch = curl_init();
    $userIDsQueryString = implode('&id=', $userIDs);  // Create query string with user IDs
    $usersURL = 'https://api.twitch.tv/helix/users?id=' . $userIDsQueryString;
    curl_setopt($ch, CURLOPT_URL, $usersURL);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Client-ID: ' . $clientID,
        'Authorization: Bearer ' . $accessToken
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);  // 타임아웃 설정
    $usersResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode != 200) {
        $error_message = json_decode($usersResponse, true)['message'];
        return array('StatusCode' => $httpCode, 'message' => $error_message);
    }

    $usersData = json_decode($usersResponse, true)['data'];
    $partnerStatuses = array();
    foreach ($usersData as $userData) {
        $userID = $userData['id'];
        $isPartnered = $userData['broadcaster_type'] === 'partner';
        $partnerStatuses[$userID] = $isPartnered;
    }
    return $partnerStatuses;
}

// Get input data
$inputData = json_decode(file_get_contents('php://input'), true);

// Get OAuth token
$accessToken = getOAuthToken($clientID, $clientSecret);
if (is_array($accessToken)) {
    echo json_encode($accessToken);
    exit();
}

$channelName = $inputData['SearchValue'];
$searchData = searchChannels($clientID, $accessToken, $channelName);

if (empty($searchData['data'])) {
    echo json_encode(array('StatusCode' => 404, 'message' => 'No channels found'));
    exit();
}

$responseData = array(
    'StatusCode' => 200,
    'message' => 'Success',
    'data' => array()
);

$userIDs = array_column($searchData['data'], 'id');
$partnerStatuses = getPartnerStatuses($clientID, $accessToken, $userIDs);

foreach ($searchData['data'] as $channel) {
    $channelURL = 'https://www.twitch.tv/' . $channel['broadcaster_login'];
    $channelID = $channel['id'];
    $isPartnered = $partnerStatuses[$channelID];
    $channelData = array(
        'Nickname' => $channel['display_name'],
        'ID' => $channel['broadcaster_login'],
        'UniqueNumber' => $channelID,
        'Icon' => $channel['thumbnail_url'],
        'URL' => $channelURL,
        'Broadcasting' => $channel['is_live'],
        'Partner' => $isPartnered
    );

    array_push($responseData['data'], $channelData);
}

echo json_encode($responseData);

?>
