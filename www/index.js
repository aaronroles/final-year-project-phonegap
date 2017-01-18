
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var currentSpeed = 0;
var bleDevices = 0;

function onDeviceReady(){
    //document.addEventListener("pause", onPause, false);
    //document.addEventListener("resume", onResume, false);
    alert("Device Ready");

    // Start watching location
    var watchPosition = navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy: true});

    // Initialise bluetoothle
    bluetoothle.initialize(initResult, {"request":true, "statusReceiver":true, "restoreKey": "bluetoothleplugin-central" });

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

    // backgroundMode is enabled here
    cordova.plugins.backgroundMode.enable();
}

//
// ! -- Look at running code for when backgroundMode is enabled ! --
//

// When location is successfully retrieved
var onSuccess = function(position){
    var km = position.coords.speed * 3.6;
    currentSpeed = position.coords.speed * 3.6;
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

// When bluetoothle is initialised
var initResult = function(result){
    // If the user has enabled bluetooth
    if(result.status == "enabled"){
        //alert("bluetoothle enabled");
        // Start scanning for other bluetoothle devices 
        bluetoothle.startScan(startScanSuccess, startScanError, {services: []} );
    }
    else{
        // Prompt the user to enable bluetooth
        bluetoothle.enable(enableSuccess, enableError);
    }
}

// startScan
function startScanSuccess(result){
    if(result.status == "scanStarted"){
        alert("Scanning for device...");
        startScanSuccess(result);
    }
    else if(result.status == "scanResult"){
        alert(result.name);
        bluetoothle.stopScan(stopScanSuccess, stopScanError);
        bluetoothle.connect(connectSuccess, connectError, params);
    }
}

var startScanError = function(){
    alert("startScanError");
}

// stopScan 
var stopScanSuccess = function(result){
    alert(result.status);
}

var stopScanError = function(){
    alert("stopScanError");
}

// connect
var connectSuccess = function(result){
    alert("Connected to device")
}

var connectError = function(){
    alert("connectError");
}