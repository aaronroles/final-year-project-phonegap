
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var km = 0;
var ms = 0;
var watchingPosition = false;

function onDeviceReady(){
    // alert("Device Ready");

    cordova.plugins.notification.local.schedule({
        title: "Reminder",
        text: 'My notification',
        firstAt: today_at_20_30_pm,
        every: 'day',
        data: { key:'value' }
    })

    document.addEventListener("pause", onAppPause, false);

    // Initialise bluetoothle
    bluetoothle.initialize(initResult, {"request": true, "statusReceiver": true});

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

function onAppPause(){
    cordova.plugins.notification.local.schedule({
        title: "Paused in background",
        message: "Aaron's app paused"
    });
}

var initResult = function(result){
    if(result.status == "enabled"){
        // alert("initResult");
        createBeaconAndMonitor("mint", "b9407f30-f5f8-466e-aff9-25556b57fe6d", 4906, 24494);
    }
    else{
        // alert("BLE Error");
    }
}

function createBeaconAndMonitor(identifier, uuid, major, minor){
    // alert("createBeacon");

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

        // If inside/entered beacon region 
        if(result.state == "CLRegionStateInside"){
            document.getElementById("log").innerText = "In beacon's region";
            // watchingPosition false by default
            // so if not watchingPosition
            if(!watchingPosition){
                // watchingPosition to true
                watchingPosition = true;
                // Start watching location
                var watchPosition = navigator.geolocation.watchPosition(onSuccess, onError, {enableHighAccuracy: true});
            }

            cordova.plugins.notification.local.schedule({
                title: "Near vehicle",
                message: "Make sure this app is open"
            });
        }
        // Else if outside/exited beacon region
        else if(result.state == "CLRegionStateOutside"){
            document.getElementById("log").innerText = "Left beacon's region";
            // If you are watchingPosition
            if(watchingPosition){
                // watchingPosition to false
                watchingPosition = false;
                // Stop watching location 
                navigator.geolocation.clearWatch(watchPosition);
            }
            cordova.plugins.notification.local.schedule({
                title: "Moving away from vehicle",
                message: "Remember to open the app next time"
            });
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
    //alert("location success");
    // To get km/s multiply m/s by 3.6
    km = position.coords.speed * 3.6;
    ms = position.coords.speed;
    // Increment update 
    updates++;
    // Update text
    document.getElementById("info").innerHTML = 
        '<h2>Location Data</h2>' +
        'Updates: '     + updates + '<br>' +
        'Latitude: '    + position.coords.latitude + '<br>' +
        'Longitude: '   + position.coords.longitude + '<br>' +
        'Speed in kilometres per hour: ' + km + ' km/h <br>'
        + 'Speed in metres per second: ' + ms + ' m/s';

        // If speed greater than 10
        if(km > 10 || ms > 0){
            // lock the phone
            window.forceLock.lock(function(){
                // success
                // Send notification
                cordova.plugins.notification.local.schedule({
                    title: "Turn your phone off",
                    message: "You are driving"
                });
            },
            function(e){
                alert("error: " + e);
            })
        }
}

// When there is an error with location 
var onError = function(error){
    document.getElementById("log").innerText = error.message;
}