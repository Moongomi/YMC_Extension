
var TAB_HOME = 0;
var TAB_EXPLORE = 1;
var TAB_STORAGE = 2;
var TAB_SEARCH = 3;

function sleep(ms) {
    return new Promise(resolve=>setTimeout(resolve, ms));
}

function getMusicTitle() {
    return document.getElementsByClassName('title style-scope ytmusic-player-bar')[0].getAttribute('title');
}
function checkIsPlaying() {
    return getMusicTitle() != "";
}
function checkIsCurrentTab(index) {
    var status = document.getElementsByClassName('style-scope ytmusic-pivot-bar-renderer')[index].getAttribute('aria-selected');
    return status == "true";
}
function moveTab(index) {
    document.getElementsByClassName('style-scope ytmusic-pivot-bar-renderer')[index].click();
}

function getVolume() {
    return parseInt(document.getElementById('volume-slider').getAttribute('value'));
}
function setVolume(size) {
    if (size < 0) size = 0;
    if (size > 100) size = 100;

    document.getElementById('volume-slider').setAttribute('value', size);
}

function getPlayList() {
    let playList = [];
    
    let renderer = document.getElementsByClassName('style-scope ytmusic-grid-renderer');
    for (let i = 0; i < renderer.length; i++) {
        if (renderer[i].tagName == 'YTMUSIC-TWO-ROW-ITEM-RENDERER') {
            playList.push(renderer[i]);
        }
    }

    return playList;
}
function getMix() {
    let renderer = document.getElementsByClassName('yt-simple-endpoint image-wrapper style-scope ytmusic-two-row-item-renderer');
    for (let i = 0; i < renderer.length; i++) {
        if (renderer[i].getAttribute('title') == '내 믹스')
            return renderer[i];
    }
    return null;
}
async function checkExistMix() {
    let bFinished = false;
    let bExist = false;

    function checkMix() {
        let mix = getMix();
        bExist = mix != null;
        bFinished = true;
        return true;
    }
    function checkTab() {
        if (checkIsCurrentTab(TAB_HOME))
            setTimeout(checkMix, 100);
        else
            setTimeout(checkTab, 100);
    }

    if (!checkIsCurrentTab(TAB_HOME))
        moveTab(TAB_HOME);
    checkTab();

    while (!bFinished)
        await sleep(100);

    return bExist;
}

// 조작
function clickPrevBtn() {
    let prev_btn = document.getElementsByClassName('previous-button')[0];
    prev_btn.click();
}
function clickPauseBtn() {
    let pause_btn = document.getElementsByClassName('play-pause-button')[0];
    pause_btn.click();
}
function clickNextBtn() {
    let next_btn = document.getElementsByClassName('next-button')[0];
    next_btn.click();
}
function upVolume() {
    setVolume(getVolume() + 5);
}
function downVolume() {
    setVolume(getVolume() - 5);
}
function startPlayList(playListIndex) {
    function clickPlayList() {
        let playList = getPlayList();
        if (playListIndex < 0 || playListIndex >= playList.length)
            return ;
        
        let playList_btn = playList[playListIndex].getElementsByClassName('icon style-scope ytmusic-play-button-renderer')[0];
        playList_btn.click();
    }
    function checkTab() {
        if (checkIsCurrentTab(TAB_STORAGE))
            setTimeout(clickPlayList, 100);
        else
            setTimeout(checkTab, 100);
    }
    
    if (!checkIsCurrentTab(TAB_STORAGE))
        moveTab(TAB_STORAGE);
    checkTab();
}
function startMix() {
    checkExistMix().then(function(result) {
        if (!result) return ;
        
        let mix = getMix();
        let mix_btn = mix.getElementsByClassName('icon style-scope ytmusic-play-button-renderer')[0];
        mix_btn.click();
    });
}
function startDefault() {
    checkExistMix().then(function(result) {
        if (result) {
            let mix = getMix();
            let mix_btn = mix.getElementsByClassName('icon style-scope ytmusic-play-button-renderer')[0];
            mix_btn.click();
        }
        else {
            startPlayList(1);
        }
    });
}

function connect() {
    websocket = new WebSocket("ws://localhost:9002/");

    websocket.onmessage = function (event) {
        let msg = event.data.split(' ');
        switch (msg[0]) {
        case "prev":        clickPrevBtn();         break;
        case "next":        clickNextBtn();         break;
        case "start":       startPlayList(msg[1]);  break;
        case "start_mix":   startMix();             break;
        case "volume_down": downVolume();           break;
        case "volume_up":   upVolume();             break;
        case "pause":
            {
                if (checkIsPlaying())
                    clickPauseBtn();
                else
                    startDefault();
                break;
            }
        }
    };
}

connect();