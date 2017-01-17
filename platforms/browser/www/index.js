
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var currentSpeed;

function onDeviceReady(){
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    //alert("Device Ready");

    if(cordova.plugins.backgroundMode.isEnabled()){
        alert("bg mode true")
    }
    else{alert("false")};

    var watchPosition = navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy: true});

    // If it has permissions
    cordova.plugins.notification.local.hasPermission(function(granted){
        // If it is allowed
        if(granted == true){
            // Schedule notification
            cordova.plugins.notification.local.schedule({
                title: "Thanks for opening the app",
                message: "If you see this, it works"
            }); 
        }
        else{
            // Otherwise register the permission
            cordova.plugins.notification.local.registerPermission(function(granted){
                // If it is then allowed
                if(granted == true){
                    // Schedule notification
                    cordova.plugins.notification.local.schedule({
                        title: "Thanks for opening the app",
                        message: "If you see this, it works"
                    });
                }
                else{
                    alert("Notifications not allowed");
                }
            });
        }
    });
}

function onPause(){
    // When app is paused, enable background mode
    cordova.plugins.backgroundMode.enable();
}

function onResume(){
    // When app resumes, disable background mode
    cordova.plugins.backgroundMode.disable();
}

// When location is successfully retrieved
var onSuccess = function(position){
    var km = currentSpeed = position.coords.speed * 3.6;
    updates++;

    document.getElementById("info").innerHTML = 
        '<h2>Location Data</h2>' +
        'Updates: '     + updates + '<br>' +
        'Latitude: '    + position.coords.latitude + '<br>' +
        'Longitude: '   + position.coords.longitude + '<br>' +
        //'Accuracy: '    + position.coords.accuracy + '<br>' +
        'Speed: '       + km + ' km/h';

        if(position.coords.speed > 0){
            alert("SLOW DOWN");
            cordova.plugins.notification.local.schedule({
                        title: "Turn your phone off",
                        message: "You are driving"
            });
        }
}

// When there is an error with location 
var onError = function(position){
    alert("Error with your location services");
}

// When backgroundMode is active
cordova.plugins.backgroundMode.onactivate = function () {
    setTimeout(function () {
        // Modify the currently displayed notification
        cordova.plugins.backgroundMode.configure({
            text:'Moving at ' + currentSpeed + ' km/h'
        });
    }, 5000);
}