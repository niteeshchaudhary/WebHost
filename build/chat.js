var currentUserKey = '';
var chatKey = '';
var friend_id = '';

////////////////////////////////////////
function ChangeSendIcon(control) {
    try{
    if (control.innerHTML !== '') {
        document.getElementById('send').removeAttribute('style');
        document.getElementById('audio').setAttribute('style', 'display:none');
    }
    else {
        document.getElementById('audio').removeAttribute('style');
        document.getElementById('send').setAttribute('style', 'display:none');
    }
}catch(evt){
console.log("err:ChangeSendIcon");
}
}

/////////////////////////////////////////////
// Audio record

let chunks = [];
let recorder;
var timeout;

function record(control,firebase) {
    try{
    let device = navigator.mediaDevices.getUserMedia({ audio: true });
    device.then(stream => {
        if (recorder === undefined) {
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                chunks.push(e.data);

                if (recorder.state === 'inactive') {
                    let blob = new Blob(chunks, { type: 'audio/webm' });
                    //document.getElementById('audio').innerHTML = '<source src="' + URL.createObjectURL(blob) + '" type="video/webm" />'; //;
                    var reader = new FileReader();

                    reader.addEventListener("load", function () {
                        var chatMessage = {
                            userId: currentUserKey,
                            msg: reader.result,
                            msgType: 'audio',
                            dateTime: new Date().toLocaleString()
                        };

                        firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error) {
                            if (error) alert(error);
                            else {

                                document.getElementById('txtMessage').value = '';
                                document.getElementById('txtMessage').focus();
                            }
                        });
                    }, false);

                    reader.readAsDataURL(blob);
                }
            }

            recorder.start();
            control.setAttribute('class', 'fas fa-stop fa-2x');
        }
    });

    if (recorder !== undefined) {
        if (control.getAttribute('class').indexOf('stop') !== -1) {
            recorder.stop();
            control.setAttribute('class', 'fas fa-microphone fa-2x');
        }
        else {
            chunks = [];
            recorder.start();
            control.setAttribute('class', 'fas fa-stop fa-2x');
        }
    }
}catch(evt){
    console.log("err: record");
}
}

/////////////////////////////////////////////////////////////////
// Emoji

function loadAllEmoji() {
    try{
    var emoji = '';
    for (var i = 128512; i <= 128566; i++) {
        emoji += `<a href="#" style="font-size: 22px;" onclick="getEmoji(this)">&#${i};</a>`;
    }

    document.getElementById('smiley').innerHTML = emoji;
}catch(evt){
    console.log("err:Load All");
}
}

function showEmojiPanel() {
    try{
    document.getElementById('emoji').removeAttribute('style');
    }catch(evt){
        console.log("err:ShowEmoji");
    }
}

function hideEmojiPanel() {
    try{
    document.getElementById('emoji').setAttribute('style', 'display:none;');
    }catch(evt){
        console.log("err:hideEmoj");
    }
}

function getEmoji(control) {
    try{
    document.getElementById('txtMessage').value += control.innerHTML;
}catch(evt){
    console.log("err:getEmoj");
}
}
//////////////////////////////////////////////////////////////////////
function StartChat(friendKey, friendName, friendPhoto,firebase) {
    try{
    var friendList = { friendId: friendKey, userId: currentUserKey };
    friend_id = friendKey;

    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))) {
                flag = true;
                chatKey = data.key;
                console.log(data.key);
            }
        });

        if (flag === false) {
            chatKey = firebase.database().ref('friend_list').push(friendList, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style', 'display:none');
                    hideChatList();
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style', 'display:none');
            hideChatList();
        }
        //////////////////////////////////////
        //display friend name and photo
        document.getElementById('divChatName').innerHTML = friendName;
        document.getElementById('imgChat').src = friendPhoto;

        document.getElementById('messages').innerHTML = '';

        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();
        ////////////////////////////
        // Display The chat messages
        LoadChatMessages(chatKey, friendPhoto);
    });
}catch(evt){
    console.log("err:StartChat");
}
}

//////////////////////////////////////

function LoadChatMessages(chatKey, friendPhoto,firebase) {
    try{
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function (chats) {
        var messageDisplay = '';
        chats.forEach(function (data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");
            var msg = '';
            if (chat.msgType === 'image') {
                msg = `<img src='${chat.msg}' class="img-fluid" />`;
            }
            else if (chat.msgType === 'audio') {
                msg = `<audio controls>
                        <source src="${chat.msg}" type="video/webm" />
                    </audio>`;
            }
            else {
                msg = chat.msg;
            }
            if (chat.userId !== currentUserKey) {
                messageDisplay += `<div class="row">
                                    <div class="col-2 col-sm-1 col-md-1">
                                        <img src="${friendPhoto}" class="chat-pic rounded-circle" />
                                    </div>
                                    <div class="col-6 col-sm-7 col-md-7">
                                        <p class="receive">
                                            ${msg}
                                            <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                                        </p>
                                    </div>
                                </div>`;
            }
            else {
                messageDisplay += `<div class="row justify-content-end">
                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="sent float-right">
                                    ${msg}
                                    <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                                </p>
                            </div>
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle" />
                            </div>
                        </div>`;
            }
        });

        document.getElementById('messages').innerHTML = messageDisplay;
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    });
}catch(evt){
    console.log("err:LoadChat");
}
}

function showChatList() {
    try{
    document.getElementById('side-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
}catch(evt){
    console.log("err:Show Chat");
}
}

function hideChatList() {
    try{
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}catch(evt){
    console.log("err:HideChatList");
}
}


function SendMessage(firebase) {
    try{
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        msgType: 'normal',
        dateTime: new Date().toLocaleString()
    };

    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error) {
        if (error) alert(error);
        else {
            firebase.database().ref('fcmTokens').child(friend_id).once('value').then(function (data) {
                $.ajax({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=AIzaSyAC6U0qAtQegHkMh73_WCSUfwt-B5Ehzbo'
                    },
                    data: JSON.stringify({
                        'to': data.val().token_id, 'data': { 'message': chatMessage.msg.substring(0, 30) + '...', 'icon': firebase.auth().currentUser.photoURL }
                    }),
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr.error);
                    }
                });
            });
            document.getElementById('txtMessage').value = '';
            document.getElementById('txtMessage').focus();
        }
    });
}catch(evt){
    console.log("err:SendMessage");
}
}

///////////////////////////////////////////////////////////////
//Send image
function ChooseImage() {
    try{
    document.getElementById('imageFile').click();
}catch(evt){
    console.log("err:ChooseImg");
}
}

function SendImage(event,firebase) {
    try{
        var file = event.files[0];

    if (!file.type.match("image.*")) {
        alert("Please select image only.");
    }
    else {
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            var chatMessage = {
                userId: currentUserKey,
                msg: reader.result,
                msgType: 'image',
                dateTime: new Date().toLocaleString()
            };

            firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error) {
                if (error) alert(error);
                else {

                    document.getElementById('txtMessage').value = '';
                    document.getElementById('txtMessage').focus();
                }
            });
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }
}
catch(evt){
    console.log("err:SendImage");
}
}
///////////////////////////////////////////////////////////////////////
/////////////

function LoadChatList(firebase) {
    try{
    var db = firebase.database().ref('friend_list');
    db.on('value', function (lists) {
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item" style="background-color:#f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                        </li>`;
        lists.forEach(function (data) {
            var lst = data.val();
            var friendKey = '';
            if (lst.friendId === currentUserKey) {
                friendKey = lst.userId;
            }
            else if (lst.userId === currentUserKey) {
                friendKey = lst.friendId;
            }

            if (friendKey !== "") {
                firebase.database().ref('users').child(friendKey).on('value', function (data) {
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${user.photoURL}" class="friend-pic rounded-circle" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${user.name}</div>
                                    <div class="under-name">This is some message text...</div>
                                </div>
                            </div>
                        </li>`;
                });
            }
        });
    });
}catch(evt){
    console.log("err:LoadChatList");
}
}

function PopulateUserList(firebase) {
    try{
    document.getElementById('lstUsers').innerHTML = `<div class="text-center">
                                                         <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                                                     </div>`;
    var db = firebase.database().ref('users');
    var dbNoti = firebase.database().ref('notifications');
    var lst = '';
    db.on('value', function (users) {
        if (users.hasChildren()) {
            lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                        </li>`;
            document.getElementById('lstUsers').innerHTML = lst;
        }
        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== firebase.auth().currentUser.email) {
                dbNoti.orderByChild('sendTo').equalTo(data.key).on('value', function (noti) {
                    if (noti.numChildren() > 0 && Object.values(noti.val())[0].sendFrom === currentUserKey) {
                        lst = `<li class="list-group-item list-group-item-action">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${user.photoURL}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${user.name}
                                        <button class="btn btn-sm btn-defualt" style="float:right;"><i class="fas fa-user-plus"></i> Sent</button>
                                    </div>
                                </div>
                            </div>
                        </li>`;
                        document.getElementById('lstUsers').innerHTML += lst;
                    }
                    else {
                        dbNoti.orderByChild('sendFrom').equalTo(data.key).on('value', function (noti) {
                            if (noti.numChildren() > 0 && Object.values(noti.val())[0].sendTo === currentUserKey) {
                                lst = `<li class="list-group-item list-group-item-action">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${user.photoURL}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${user.name}
                                        <button class="btn btn-sm btn-defualt" style="float:right;"><i class="fas fa-user-plus"></i> Pending</button>
                                    </div>
                                </div>
                            </div>
                        </li>`;
                                document.getElementById('lstUsers').innerHTML += lst;
                            }
                            else {
                                lst = `<li class="list-group-item list-group-item-action" data-dismiss="modal">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${user.photoURL}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${user.name}
                                        <button onclick="SendRequest('${data.key}')" class="btn btn-sm btn-primary" style="float:right;"><i class="fas fa-user-plus"></i> Send Request</button>
                                    </div>
                                </div>
                            </div>
                        </li>`;

                                document.getElementById('lstUsers').innerHTML += lst;
                            }
                        });
                    }
                });
            }
        });
    });
}catch(evt){
    console.log("err:Populate userList");
}

}

function NotificationCount(firebase) {
    try{
    let db = firebase.database().ref('notifications');

    db.orderByChild('sendTo').equalTo(currentUserKey).on('value', function (noti) {
        let notiArray = Object.values(noti.val()).filter(n => n.status === 'Pending');
        document.getElementById('notification').innerHTML = notiArray.length;
    });
}catch(evt){
    console.log("err:NotificationCount");
}
}

function SendRequest(key,firebase) {
    try{
    let notification = {
        sendTo: key,
        sendFrom: currentUserKey,
        name: firebase.auth().currentUser.displayName,
        photo: firebase.auth().currentUser.photoURL,
        dateTime: new Date().toLocaleString(),
        status: 'Pending'
    };

    firebase.database().ref('notifications').push(notification, function (error) {
        if (error) alert(error);
        else {
            // do something
            PopulateUserList(firebase);
        }
    });
}catch(evt){
    console.log("err:SendReq");
}
}

function PopulateNotifications(firebase) {
    try{
    document.getElementById('lstNotification').innerHTML = `<div class="text-center">
                                                         <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                                                     </div>`;
    var db = firebase.database().ref('notifications');
    var lst = '';
    db.orderByChild('sendTo').equalTo(currentUserKey).on('value', function (notis) {
        if (notis.hasChildren()) {
            lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                        </li>`;
        }
        notis.forEach(function (data) {
            var noti = data.val();
            if (noti.status === 'Pending') {
                lst += `<li class="list-group-item list-group-item-action">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${noti.photo}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${noti.name}
                                        <button onclick="Reject('${data.key}')" class="btn btn-sm btn-danger" style="float:right;margin-left:1%;"><i class="fas fa-user-times"></i> Reject</button>
                                        <button onclick="Accept('${data.key}')" class="btn btn-sm btn-success" style="float:right;"><i class="fas fa-user-check"></i> Accept</button>
                                    </div>
                                </div>
                            </div>
                        </li>`;
            }
        });

        document.getElementById('lstNotification').innerHTML = lst;
    });
}catch(evt){
    console.log("err:Popultenotif");
}
}

function Reject(key,firebase) {
    let db = firebase.database().ref('notifications').child(key).once('value', function (noti) {
        let obj = noti.val();
        obj.status = 'Reject';
        firebase.database().ref('notifications').child(key).update(obj, function (error) {
            if (error) alert(error);
            else {
                // do something
                PopulateNotifications();
            }
        });
    });
}

function Accept(key,firebase) {
    let db = firebase.database().ref('notifications').child(key).once('value', function (noti) {
        var obj = noti.val();
        obj.status = 'Accept';
        firebase.database().ref('notifications').child(key).update(obj, function (error) {
            if (error) alert(error);
            else {
                // do something
                PopulateNotifications();
                var friendList = { friendId: obj.sendFrom, userId: obj.sendTo };
                firebase.database().ref('friend_list').push(friendList, function (error) {
                    if (error) alert(error);
                    else {
                        //do Something
                    }
                });
            }
        });
    });
}

function PopulateFriendList() {
    //document.getElementById('lstFriend').innerHTML = `<div class="text-center">
    //                                                     <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
    //                                                 </div>`;
    //var db = firebase.database().ref('users');
    //var lst = '';
    //db.on('value', function (users) {
    //    if (users.hasChildren()) {
    //        lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
    //                        <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
    //                    </li>`;
    //    }
    //    users.forEach(function (data) {
    //        var user = data.val();
    //        if (user.email !== firebase.auth().currentUser.email) {
    //            lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
    //                        <div class="row">
    //                            <div class="col-md-2">
    //                                <img src="${user.photoURL}" class="rounded-circle friend-pic" />
    //                            </div>
    //                            <div class="col-md-10" style="cursor:pointer;">
    //                                <div class="name">${user.name}</div>
    //                            </div>
    //                        </div>
    //                    </li>`;
    //        }
    //    });

    //    document.getElementById('lstFriend').innerHTML = lst;
    //});

}

function signIn(firebase) {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
    window.firebase=firebase;
}

function signOut(firebase) {
    //firebase.auth().signOut();
    onFirebaseStateChanged(firebase);
}

function onFirebaseStateChanged(firebase) {
    try{
        firebase.auth().onAuthStateChanged(onStateChanged(firebase.auth().currentUser,firebase));

    }
    catch(evt){
        console.log("clled");
    }
}

function onStateChanged(user,firebase) {
    try{
    if (user) {
        //alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);

        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;

        var db = firebase.database().ref('users');
        var flag = false;
        db.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    currentUserKey = data.key;
                    flag = true;
                }
            });

            if (flag === false) {
                firebase.database().ref('users').push(userProfile, callback);
            }
            else {
                document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;

                document.getElementById('lnkSignIn').style = 'display:none';
                document.getElementById('lnkSignOut').style = '';
            }

            const messaging = firebase.messaging();

            navigator.serviceWorker.register('./firebase-messaging-sw.js')
                .then((registration) => {
                    messaging.useServiceWorker(registration);

                    // Request permission and get token.....
                    messaging.requestPermission().then(function () {
                        return messaging.getToken();
                    }).then(function (token) {
                        firebase.database().ref('fcmTokens').child(currentUserKey).set({ token_id: token });
                    })
                });

            document.getElementById('lnkNewChat').classList.remove('disabled');
            LoadChatList();
            NotificationCount();
        });
        console.log("if exec");
    }
    else {
        document.getElementById('imgProfile').src = 'images/pp.png';
        document.getElementById('imgProfile').title = '';

        document.getElementById('lnkSignIn').style = '';
        document.getElementById('lnkSignOut').style = 'display:none';

        document.getElementById('lnkNewChat').classList.add('disabled');
        console.log("el exec");
    }
    console.log("exec");
}
catch(evt){
    console.log(evt);
}
}

function callback(error,firebase) {
    if (error) {
        alert(error);
    }
    else {
        document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;

        document.getElementById('lnkSignIn').style = 'display:none';
        document.getElementById('lnkSignOut').style = '';
    }
}

/////////
// Call auth State changed