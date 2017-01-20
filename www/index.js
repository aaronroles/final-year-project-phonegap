
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var km = 0;
var bleDevices = 0;
var enabled = false;
var scanning = false;
var scanAllowed = true;

function onDeviceReady(){
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
    km = position.coords.speed * 3.6;
    updates++;

    document.getElementById("info").innerHTML = 
        '<h2>Location Data</h2>' +
        'Updates: '     + updates + '<br>' +
        'Latitude: '    + position.coords.latitude + '<br>' +
        'Longitude: '   + position.coords.longitude + '<br>' +
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
        // enabled 
        alert("Bluetooth LE is enabled");
        startScan();
    }
    else{
        // Prompt the user to enable bluetooth
        bluetoothle.enable(enableSuccess, enableError);
    }
}

// startScan
function startScan(){
    bluetoothle.startScan(startScanSuccess, startScanError, {});
}

function startScanSuccess(result){
    if(result.status == "scanStarted"){
        // scanning
        alert("Scanning for device...");
    }
    else if(result.status == "scanResult"){
        connect(result.name, result.address);
    }
}

var startScanError = function(error){
    alert(error.message);
}

// stopScan 
var stopScanSuccess = function(result){
    alert(result.status);
}

var stopScanError = function(error){
    alert(error.message);
}

// connect
function connect(name, address){
    alert("Connecting to " + name);
    bluetoothle.stopScan(stopScanSuccess, stopScanError);
    bluetoothle.connect(connectSuccess, connectError, {address: address} );
}

var connectSuccess = function(result){
    alert("Connected to device");
    if(result.status == "connected"){
        bluetoothle.discover(discoverSuccess, discoverError, {address: result.address})
    }
}

var connectError = function(error){
    alert(error.message);
}

// enable
var enableSuccess = function(){
    startScan();
}

var enableError = function(error){
    alert(error.message);
}

// discover
var discoverSuccess = function(result){
    // Discover success
}

var discoverError = function(error){
    alert(error.message);
}