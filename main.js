let isRunning;
let watchObject;
let GLOBAL_COORDINATES = [];
let accumulatedDistance = 0;


$(document).ready(function () {
    isRunning = false;

    $("#watch").on("click", function () {
        if (isRunning) {
            navigator.geolocation.clearWatch(watchObject);
            isRunning = false;
            accumulatedDistance += metersToMiles(geolib.getPathLength(GLOBAL_COORDINATES));
            GLOBAL_COORDINATES = [];
            $(this).text("Start");
        } else {
            watchObject = navigator.geolocation.watchPosition(function (position) {
                let newCoordinates = {"latitude": position.coords.latitude,
                                      "longitude": position.coords.longitude,
                                      "accuracy": position.coords.accuracy
                }
                if (newCoordinates.accuracy < 500) {
                    if (GLOBAL_COORDINATES.length === 0) {
                        GLOBAL_COORDINATES.push(newCoordinates);
                    } else {
                        if (isBeyondMarginOfError(GLOBAL_COORDINATES[GLOBAL_COORDINATES.length - 1], newCoordinates)) {
                            GLOBAL_COORDINATES.push(newCoordinates);
                            let currentDistance = metersToMiles(geolib.getPathLength(GLOBAL_COORDINATES)) + accumulatedDistance;
                            $("#current-distance").text("Tot: " + currentDistance.toFixed(3) + " mi");
                            $("#last-leg-distance").text(getLastLeg(GLOBAL_COORDINATES));
                        }
                    }
                }

                let newDiv = $(
                    `<div>
                        <p>Lon: ${newCoordinates.longitude}</p>
                        <p>Lat: ${newCoordinates.latitude}</p>
                        <p>Acc: ${newCoordinates.accuracy}</p>
                        <p>...</p>
                    </div>`
                );
                $("#output").prepend(newDiv);
            }, function () { }, { enableHighAccuracy: true });
            isRunning = true;
            $(this).text("Stop");
        }
    });
});

/* @returns boolean */
function isBeyondMarginOfError(startingCoordinates, endingCoordinates) {
    return true;
    // if (!startingCoordinates)
    //     return true;
    // let distance = geolib.getDistance(startingCoordinates, endingCoordinates);
    // let accuracy = 2 * startingCoordinates.accuracy + 2 * endingCoordinates.accuracy;
    // return (distance > accuracy);
}

/* @returns string */
function getLastLeg(coordinates) {
    if (coordinates && coordinates.length > 1) {
        let endIndex = coordinates.length - 1;
        let startIndex = endIndex - 1;
        let tempString = "Point #" + (startIndex) + " to point #" + (endIndex) + ": ";
        tempString += metersToMiles(geolib.getDistance(coordinates[startIndex], coordinates[endIndex])).toFixed(3);
        return tempString;
    } else {
        return "Fewer than 2 data points.";
    }
}

function metersToMiles(number) {
    return (number * 0.0006213711922);
}