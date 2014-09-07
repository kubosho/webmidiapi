var m;
var inputs, outputs;
var midiout;
var timerId;

window.onload = function () {
    // #1 requestMIDIAccessでMIDIデバイスを取得
    navigator.requestMIDIAccess({
        sysex: false
    })
    .then(successCallback, errorCallback);
};
    
// #2 MIDIデバイスの取得が完了した時のCallback
function successCallback(access) {
    m = access;

    var inputFragment = document.createDocumentFragment();
    var outputFragment = document.createDocumentFragment();

    // inputデバイス一覧をGlobal変数inputsへ
    inputs = m.inputs();

    // プルダウンメニューにinputデバイスをリストアップ
    inputs.forEach(function (key, port) {
        var opt = document.createElement('option');
        opt.text = key.name;
        opt.value = port;
        inputFragment.appendChild(opt);
    });
    var mIn = document.getElementById("midiInSel");
    mIn.appendChild(inputFragment);

    // outputデバイス一覧ををGlobal変数outputsへ
    outputs = m.outputs();

    // プルダウンメニューにoutputデバイスをリストアップ
    outputs.forEach(function (key, port) {
        var opt = document.createElement('option');
        opt.text = key.name;
        opt.value = port;
        outputFragment.appendChild(opt);
    });
    var mOut = document.getElementById("midiOutSel");
    mOut.appendChild(outputFragment);

    /* Inputボタンを押した時の動作 */
    document.getElementById("midiInSelB").addEventListener("click", function(){
        var port = document.getElementById("midiInSel").value;
        for(var i = 0; i < inputs.length; i++) {
            inputs[i].onmidimessage = function () {
                return;
            };
        }
        // 選択したデバイスのinputポートにEventを指定
        inputs[port].onmidimessage = function (event) {
            midiout.send(event.data);
            fKey.onmessage(event.data);
        };
    });

    /* Outputボタンを押した時の動作 */
    document.getElementById("midiOutSelB").addEventListener("click", function(){
        var port = document.getElementById("midiOutSel").value;
        // 選択したデバイスをoutputポートに指定
        midiout = outputs[port];
        voiceChange(0);
        fKey.setConnected();
    });

    /* ProgramChangeのスライダを動かした時の動作 */
    document.getElementById("programChangeRange").addEventListener("change", function(){
        var voiceNo = document.getElementById("programChangeRange").value;
        voiceChange(voiceNo);
    });

    /* Panicボタンを押した時の動作 */
    document.getElementById("panicButton").addEventListener("click", function(){
        // #8 AllSoundOff, resetAllController, allNoteOff のメッセージを送信
        midiout.send([0xb0, 0x78, 0x00]); // AllSoundOff
        midiout.send([0xb0, 0x79, 0x00]); // ResetAllController
        midiout.send([0xb0, 0x7b, 0x00]); // AllNoteOff
    });
}

/* MIDIデバイスリスト取得を失敗したときのCallback */
function errorCallback(e){
    console.log(e);
}

function voiceChange(voiceNo) {
    if(midiout !== null) {
        // #9 ProgramChangeのメッセージを送信
        midiout.send([0xc0, voiceNo]);
    }
    var dVoiceNo = parseInt(voiceNo) + 1;
    document.getElementById("voiceName").innerHTML = dVoiceNo + ". "+ voiceList.getGMVoiceName("instruments", voiceNo);
}

/**
 * SoftWareキーボードの動作
 * js file: flatKeyboard.js
 */   
var fKey = new FlatKeyboard("keyboard");
timerId = setInterval(function () {
    fKey.draw();
}, 64);

fKey.noteOn = function (noteNo) {
    midiout.send([0x90, noteNo, 127]);
};

fKey.noteOff = function (noteNo) {
    midiout.send([0x80, noteNo, 127]);
};

