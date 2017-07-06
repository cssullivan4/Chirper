var $chirpButton = $('#chirp-btn');
var $chirpField = $('#chirp-field');
var $chirpList = $('#chirp-list');
var $userSelector = $('#user-selector');

$chirpField.on('input', function () {
    var isEmpty = $chirpField.val().length === 0;
    $chirpButton.prop('disabled', isEmpty);
});
$chirpButton.click(postChirp);

function postChirp() {
    var chirp = {
        message: $chirpField.val(),
        userid: $userSelector.val(),
        timestamp: new Date().toISOString()
    };
    $.ajax({
        method: 'POST',
        url: '/api/chirps',
        contentType: 'application/json',
        data: JSON.stringify(chirp)
    }).then(function (success) {
        $chirpField.val('');
        $chirpButton.prop('disabled', true);
        getChirps();
    }, function (err) {
        console.log(err);
    });
}


function getChirps() {
    $.ajax({
        method: 'GET',
        url: '/api/chirps'
    }).then(function (chirps) {
        $chirpList.empty();
        for (var i = 0; i < chirps.length; i++) {
            addChirpDiv(chirps[i]); // passing in entire object
        }
    }, function (err) {
        console.log(err);
    })
}
getChirps();

function deleteChirps(id) {
    $.ajax({
        method: 'DELETE',
        url: '/api/chirps/' + id
    }).then(function() {
        getChirps();
    }, function(err) {
        console.log(err);
    })
}

function addChirpDiv(chirp) {
    var $chirpDiv = $('<div class="chirp"></div>');
    var $message = $('<p></p>');
    var $user = $('<h4></h4>');
    var $timestamp = $('<h5></h5>');
    var $delButton = $('<button class="delete-button">Delete</button>');
    $delButton.click(function () {
        deleteChirp(chirp.id);
    });

    $message.text(chirp.message);
    $user.text(chirp.user);
    $timestamp.text(new Date(chirp.timestamp).toLocaleString());

    $message.appendTo($chirpDiv);
    $user.appendTo($chirpDiv);
    $timestamp.appendTo($chirpDiv);
    $delButton.appendTo($chirpDiv);

    $chirpDiv.appendTo($chirpList);
}

function populateUsers() {
    $.ajax({
        method: 'GET',
        url: '/api/users'
    }).then(function(users) {
        for (var i = 0; i < users.length; i++) {
            var $userOption = $('<option value="' + users[i].id + '">' + users[i].name + '</option>');
            $userSelector.append($userOption);
        }
    }, function(err) {
        console.log(err);
    });
}
populateUsers();