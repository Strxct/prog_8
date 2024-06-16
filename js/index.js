//load kNear
k = 3
const knn = new kNear(5)






window.onload = learn()

let model;

let ctx;
let video = document.getElementById("videoElement");
let canvas = document.getElementById("canvasElement");

const VIDEO_WIDTH = 600
const VIDEO_HEIGHT = 420

let dataBtn = document.getElementById("dataLog")
dataBtn.addEventListener("click", toggleData)
let consoleData = false

let fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
}

function displayHandSkeleton(landmarks) {
    for (let i = 0; i < landmarks.length; i++) {
        const y = landmarks[i][0];
        const x = landmarks[i][1];

        drawPoint(x, y)
    }

    const fingers = Object.keys(fingerLookupIndices)

    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i]
        const points = fingerLookupIndices[finger].map(idx => landmarks[idx])
        drawPath(points)
    }
}

function toggleData() {
    if (consoleData != true) {
        consoleData = true
    } else {
        consoleData = false
    }
}

async function predict() {
    // draw the frames obtained from video stream on a canvas
    ctx.drawImage(video, 0, 0, canvas.clientWidth, canvas.height);

    // predict landmarks on hand (3D) in the frame of a video
    const predictions = await model.estimateHands(video);

    if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        displayHandSkeleton(landmarks)

        if (consoleData === true) {
            logData(predictions)
        }
        knnPredict(predictions)
    }

    requestAnimationFrame(predict);
}

// draw point in fingers
function drawPoint(y, x) {
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()
}

// draw line between points in fingers
function drawPath(points) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])

    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (false) {
        region.closePath()
    }

    ctx.stroke(region)
}

function logData(predictions) {
    let str = ""

    for (let i = 0; i < 20; i++) {
        str += predictions[0].landmarks[i][0] + ", " + predictions[0].landmarks[i][1] + ", " + predictions[0].landmarks[i][2] + ", "
    }

    const log = document.getElementById("outcome")

    log.innerText = str
}

// start the webcam and play it
function startCam() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: {
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT
            },
            audio: false
        })
            .then(stream => {
                // assign video stream to element
                video.srcObject = stream;

                // start playing video
                video.play();
            })
            .catch(e => {
                console.log(`Error in video stream!: ${e}`)
            });
    }

    video.onloadedmetadata = () => {

        videoWidth = video.videoWidth
        videoHeight = video.videoHeight

        canvas.width = videoWidth
        canvas.height = videoHeight

        // get the 2D graphics context from the canvas
        ctx = canvas.getContext('2d');

        video.width = videoWidth
        video.height = videoHeight

        ctx.strokeStyle = "red"
        ctx.fillStyle = "blue"

        // reset the point (0,0) to a given point
        ctx.translate(canvas.width, 0);

        // flip the context
        ctx.scale(-1, 1);

        // start the preciction indefinitely on the video stream
        requestAnimationFrame(predict);
    }
}

function knnPredict(predictions) {
    let predictP = document.getElementById("predict")

    // console.log(predictions)

    let array = []

    for (let i = 0; i < 20; i++) {
        array.push(predictions[0].landmarks[i][0])
        array.push(predictions[0].landmarks[i][1])
        array.push(predictions[0].landmarks[i][2])
    }


    let prediction = knn.classify(array)
    predictP.innerHTML = prediction
}

async function main() {
    // load the model
    model = await handpose.load()

    // start the webcam and play it
    startCam()
}


function baddata(dataArray) {
    // Step 1: Calculate averages for each emote
    const averages = {};

    dataArray.forEach(data => {
        const emote = data.output;
        const inputData = data.input;

        // Initialize averages
        if (!averages[emote]) {
            averages[emote] = {
                inputSum: Array.from({ length: inputData.length }, () => 0),
                count: 0
            };
        }

        // Accumulate input values
        averages[emote].inputSum = averages[emote].inputSum.map((sum, index) => sum + inputData[index]);
        averages[emote].count++;
    });

    // Calculate actual averages
    for (const emote in averages) {
        averages[emote].inputAvg = averages[emote].inputSum.map(sum => sum / averages[emote].count);
    }

    // Flag to track if bad data has been found and logged
    let badDataLogged = false;

    // Step 2: Check for bad data entries
    dataArray.some(data => {
        const emote = data.output;
        const inputData = data.input;
        const averageInput = averages[emote].inputAvg;

        let isBadData = false;

        // Compare each input value to the average for this emote
        for (let i = 0; i < inputData.length; i++) {
            const deviation = Math.abs(inputData[i] - averageInput[i]);

            // Set a threshold for what constitutes a "bad" deviation
            if (deviation > 50) {  // Adjust the threshold as needed
                isBadData = true;
                break;  // No need to check further once we've identified bad data
            }
        }

        // If bad data is found and not already logged, log it and set flag
        if (isBadData && !badDataLogged) {
            console.log(`Bad data found for emote ${emote}:`, data);
            badDataLogged = true;  // Set flag to true to indicate bad data has been logged
        }

        // Continue checking for bad data until found
        return badDataLogged;
    });
}

// Usage example with fetch
function learn() {
    fetch('data.json')
        .then(response => response.json())
        .then(dataArray => {
            baddata(dataArray);
            learnDataFromJson(dataArray)
        })
        .catch(error => {
            console.error('Error fetching or parsing JSON:', error);
        });
}

// Call learn function to start learning from JSON data
learn();


function learnDataFromJson(dataArray) {
    // Iterate over each object in dataArray
    dataArray.forEach(data => {
        const inputData = data.input;
        const outputData = data.output;

        // Learn each set of data
        knn.learn(inputData, outputData);
    });
}

// function learn() {
//     fetch('data.json')
//         .then(response => response.json())
//         .then(dataArray => {
//             // Call function to learn from fetched data
//             learnDataFromJson(dataArray);
//         })
//         .catch(error => {
//             console.error('Error fetching or parsing JSON:', error);
//         });
// }



main()