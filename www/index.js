
document.addEventListener("deviceready", onDeviceReady, false);

var updates = 0;
var km = 0;
var enabled = false;
var scanning = false;
var scanAllowed = true;

function onDeviceReady(){
    alert("Device Ready");

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
    //cordova.plugins.backgroundMode.enable();
}

//
// ! -- Look at running code for when backgroundMode is enabled ! --
//

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
        'Speed in kilometres per hour: ' + km + ' km/h <br>' +
        'Speed in metres per second: ' + position.coords.speed + ' m/s';

        // If speed greater than 0
        if(position.coords.speed > 0){
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
var onError = function(position){
    alert("Error with your location services");
}