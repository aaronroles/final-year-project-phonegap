
// Add event listener to handle when the device is ready to go
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var km = 0;
var watchingPosition = false;

// This function is called when device is ready
function onDeviceReady(){

    // Add pause event listener for when app is in background 
    document.addEventListener("pause", onAppPause, false);

    // Initialise bluetooth via bluetoothle plugin 
    bluetoothle.initialize(initResult, {"request": true, "statusReceiver": true});

    // If it has permissions
    cordova.plugins.notification.local.hasPermission(function(granted){
        // If it is allowed
        if(granted == true){
            // We are allowed to send notifications 
        }
        else{
            // Otherwise register the permission
            cordova.plugins.notification.local.registerPermission(function(granted){
                // If it is then allowed
                if(granted == true){
                    // We are now allowed to send notifications
                }
                // If it is still not allowed 
                else{
                    document.getElementById("log").innerText = "Notifications are not allowed";
                }
            });
        }
    });
}

// This function is called when the app is put to background or minimised
function onAppPause(){
    // Send local notification informing user app is paused 
    cordova.plugins.notification.local.schedule({
        title: "Paused in background",
        message: "Aaron's app paused"
    });
}

// initResult is called once Bluetooth is initialised
var initResult = function(result){
    // If Bluetooth was successfully enabled
    if(result.status == "enabled"){
        // Run this function which contains four parameters
        // These parameters define what Bluetooth beacon to monitor 
        createBeaconAndMonitor("mint", "b9407f30-f5f8-466e-aff9-25556b57fe6d", 4906, 24494);
    }
    else{
        // Otherwise we have a problem with Bluetooth
        alert("Bluetooth error");
    }
}

// Called after Bluetooth being enabled to start monitoring for beacons
function createBeaconAndMonitor(identifier, uuid, major, minor){
    // Create delegate object that holds beacon callback functions.
    var delegate = new cordova.plugins.locationManager.Delegate();

    // When the device actively starts looking for the beacon region 
    delegate.didStartMonitoringForRegion = function(result){
        document.getElementById("log").innerText = 
        "Searching for beacon... " + 
        "<i class='small material-icons'>bluetooth_searching</i>";
    }
    
    // When the device has entered or exited the beacon region 
    delegate.didDetermineStateForRegion = function(result){
        // If inside/entered beacon region 
        if(result.state == "CLRegionStateInside"){
            // This is done so watching location is only done when near 
            // the Bluetooth beacon, which would be placed inside a vehicle. 
            // It doesn't make sense to do it anywhere else. 
            document.getElementById("log").innerText = 
            "In beacon's region" + 
            "<i class='small material-icons'>bluetooth_connected</i>";
            // watchingPosition false by default
            // so if not watchingPosition
            if(!watchingPosition){
                // watchingPosition to true
                watchingPosition = true;
                // Start watching location
                var watchPosition = navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy: true});
            }
            // Send a local notification informing user you are near the vehicle 
            cordova.plugins.notification.local.schedule({
                title: "Near vehicle",
                message: "Make sure this app is open"
            });
        }
        // Else if outside/exited beacon region
        else if(result.state == "CLRegionStateOutside"){
            // This only works once you initially enter a beacon region 
            // then leave it. Once you leave the region there is no need
            // to monitor the user's location. 
            document.getElementById("log").innerText = "Left beacon's region"
            + "<i class='small material-icons'>bluetooth_searching</i>";
            // If you are watchingPosition
            if(watchingPosition){
                // watchingPosition to false
                watchingPosition = false;
                // Stop watching location 
                navigator.geolocation.clearWatch(watchPosition);
            }
            // Send a local notification informing user that they have moved away 
            cordova.plugins.notification.local.schedule({
                title: "Moving away from vehicle",
                message: "Remember to open the app next time"
            });
        }
    }

    // Storing the passed parameters as a beacon region object
    // This is the beacon we want to listen out for 
    var mintRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

    // Set the delegate object we want to use for beacon callbacks 
    cordova.plugins.locationManager.setDelegate(delegate);

    // Request permission from user to access location info.
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    // Start monitoring for mint beacon 
    cordova.plugins.locationManager.startMonitoringForRegion(mintRegion)
        .fail(function(e) { alert(e); })
        .done();
}

// When location is successfully retrieved
var onSuccess = function(position){
    // Multiply m/s by 3.6 to get km/h 
    km = position.coords.speed * 3.6;
    // Increment update 
    updates++;
    // Update text
    document.getElementById("info").innerHTML = 
        'Update '     + updates;
    document.getElementById("mainContent").innerHTML = 
        '<i class="small material-icons">location_searching</i> Geolocation <br>' +
        'Latitude: '    + position.coords.latitude + '<br>' +
        'Longitude: '   + position.coords.longitude + '<br>' +
        'Speed: ' + km + ' km/h <br>';

        // If speed greater than 10
        if(km > 10){
            // Lock the phone
            window.forceLock.lock(
                function(){
                    // success
                    // Send notification
                    cordova.plugins.notification.local.schedule({
                        title: "Warning!",
                        message: "Do not use your phone while driving"
                    });
                },
                function(e){
                    // error 
                    alert("error: " + e);
                })
        }
}

// When there is an error with location 
var onError = function(error){
    document.getElementById("log").innerText = error.message;
}