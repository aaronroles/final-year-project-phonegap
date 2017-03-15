
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var km = 0;

function onDeviceReady(){
    alert("Device Ready");

    // Initialise bluetoothle
    bluetoothle.initialize(initResult, {"request": true, "statusReceiver": true});

    // Start watching location
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

    // backgroundMode is enabled here
    // cordova.plugins.backgroundMode.enable();
}

//
// ! -- Look at running code for when backgroundMode is enabled ! --
//

var initResult = function(result){
    if(result.status == "enabled"){
        alert("initResult");
        createBeaconAndMonitor("mint", "b9407f30-f5f8-466e-aff9-25556b57fe6d", 4906, 24494);
    }
    else{
        alert("BLE Error");
    }
}

function createBeaconAndMonitor(identifier, uuid, major, minor){
    alert("createBeacon");

    // Create delegate object that holds beacon callback functions.
    var delegate = new cordova.plugins.locationManager.Delegate();

    // didStartMonitoringForRegion - when the device actively
    // starts looking for the beacon region 
    delegate.didStartMonitoringForRegion = function(result){
        // alert("didStartMonitoringForRegion" + JSON.stringify(result));
        document.getElementById("log").innerText = "Searching for beacon";
    }
    
    // didDetermineStateForRegion - when the device has entered  
    // or exited the beacon region 
    delegate.didDetermineStateForRegion = function(result){
        // alert("didDetermineStateForRegion" + JSON.stringify(result));

        if(result.state == "CLRegionStateInside"){
            document.getElementById("log").innerText = "In beacon's region";
        }
        else if(result.state == "CLRegionStateOutside"){
            document.getElementById("log").innerText = "Left beacon's region";
        }
    }

    var mintRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

    cordova.plugins.locationManager.setDelegate(delegate);

    // Request permission from user to access location info.
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    // Start monitoring for mint beacon 
    cordova.plugins.locationManager.startMonitoringForRegion(mintRegion)
        .fail(function(e) { console.error(e); })
        .done();
}

// When location is successfully retrieved
var onSuccess = function(position){
    // To get km/s multiply m/s by 3.6
    km = position.coords.speed * 3.6;
    // Increment update 
    updates++;
    // Update text
    document.getElementById("info").innerHTML = 
        '<h2>Location Data</h2>' +
        'Updates: '     + updates + '<br>' +
        'Latitude: '    + position.coords.latitude + '<br>' +
        'Longitude: '   + position.coords.longitude + '<br>' +
        'Speed in kilometres per hour: ' + km + ' km/h <br>';
        // + 'Speed in metres per second: ' + position.coords.speed + ' m/s';

        // If speed greater than 10
        if(km > 10){
            // lock the phone
            window.forceLock.lock(
                function(){
                    // success
                    // Enable backgroundMode
                    // cordova.plugins.backgroundMode.enable();
                    // Send notification
                    cordova.plugins.notification.local.schedule({
                        title: "Turn your phone off",
                        message: "You are driving"
                    });
                },
                function(e){
                    console.log("error", e);
                }
            )
        }
}

// When there is an error with location 
var onError = function(error){
    document.getElementById("log").innerText = error.message;
}