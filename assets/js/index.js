//navigator.getUserMedia({video:true})
const cam = document.getElementById('cam')

const startVideo = () => {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            if (Array.isArray(devices)) {
                devices.forEach(device => {
                    if (device.kind === 'videoinput'){
                        if (device.label.includes('')){
                            navigator.getUserMedia(
                                { video: {
                                    deviceId: device.deviceId
                                }},
                                stream => cam.srcObject = stream,
                                err => console.error(err)
                            )
                        }
                    }
                })
            }
        })
}

//puxa da pasta models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/assets/lib/face-api/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/lib/face-api/models'),
]).then(startVideo)

cam.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(cam)
    const canvasSize = {
        width: cam.width,
        height: cam.height
    }
    faceapi.matchDimensions(canvas, canvasSize)
    document.body.appendChild(canvas)
    setInterval(async () => {
        const detection = await faceapi.detectAllFaces(cam, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        const resizedDetection = faceapi.resizeResults(detection, canvasSize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetection)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetection)
        resizedDetection.forEach(detection => {
            const { age, gender, genderProbability } = detection
            new faceapi.draw.DrawTextField([
                `${parseInt(age, 10)} anos`,
                `${gender} - ${parseInt(genderProbability * 100, 10)}%`
            ], detection.detection.box.topRight).draw(canvas)
        })

    }, 100)
})