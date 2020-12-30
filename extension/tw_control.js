
let gVideo = null;

function sleep(ms) {
    return new Promise(resolve=>setTimeout(resolve, ms));
}

function getVideo() {
    if (gVideo == null)
        gVideo = document.getElementsByTagName('video')[0];
    return gVideo;
}
function getVideoID() {
    let strs = document.URL.split('/')
    if (strs.lenght <= 3)
        return "";
    return strs[3];
}
function getButton(target) {
    let btns = document.getElementsByTagName('button');

    for (let i = 0; i < btns.length; i++) {
        let btnTarget = btns[i].getAttribute('data-a-target');
        if (btnTarget == target)
            return btns[i];
    }

    return null;
}
function checkIsPlaying() {
    return getVideoID() != "";
}

function getVolume() {
    return getVideo().volume;
}
function setVolume(size) {
    if (size < 0) size = 0;
    if (size > 1) size = 1;

    getVideo().volume = size;
}

function getFollowChannelList() {
    // 팔로우 펼치기
    let showMoreBtn = null;
    while ((showMoreBtn = getButton('side-nav-show-more-button')) != null)
        showMoreBtn.click();
    
    // 팔로우 채널 목록 가져오기
    let followGroup = null;
    let groups = document.getElementsByClassName('tw-relative tw-transition-group');
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].parentElement.getAttribute('aria-label') == '팔로우 중인 채널') {
            followGroup = groups[i];
        }   
    }
    if (followGroup == null)
        return [];

    // 채널 선택하기
    let channelList = [];
    for (let i = 0; i < followGroup.childElementCount; i++) {
        let channel = followGroup.children[i].children[0].children[0].children[0];
        channelList.push(channel);
    }
    
    return channelList;
}

// 조작
function playFollowChannel(index) {
    let channelList = getFollowChannelList();
    if (channelList.length < index)
        return ;
    
    channelList[index-1].click();
}
function clickPauseBtn() {
    let pauseBtn = getButton('player-play-pause-button');

    if (pauseBtn != null)
        pauseBtn.click();
}
function upVolume() {
    setVolume(getVolume() + 0.1);
}
function downVolume() {
    setVolume(getVolume() - 0.1);
}

function connect() {
    websocket = new WebSocket("ws://localhost:9002/");

    websocket.onmessage = function (event) {
        let msg = event.data.split(' ');
        switch (msg[0]) {
        case "start":       playFollowChannel(msg[1]);  break;
        case "volume_down": downVolume();        break;
        case "volume_up":   upVolume();          break;
        case "pause": {
                if (checkIsPlaying())
                    clickPauseBtn();
                else
                    playFollowChannel(1);
                break;
            }
        }
    };
}

connect();