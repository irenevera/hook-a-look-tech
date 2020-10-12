// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      cameras = devices.filter(device => device.kind == "videoinput");
      if (cameras) {
        cameraId = cameras[cameras.length - 1].deviceId
        constraints = { deviceId: { exact: cameraId } };
        return navigator.mediaDevices.getUserMedia({ video: constraints });
      }
    })
    .then(stream => cameraView.srcObject = stream)
    .catch(e => console.error("Oops. Something is broken.", e));
}

// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraView.remove();
    cameraTrigger.remove();

    body = {
      requests: {
        image: {
          content: cameraSensor.toDataURL('image/jpeg').split(',')[1]
        },
        "features": [
          {
            "maxResults": 50,
            "type": "LANDMARK_DETECTION"
          },
          {
            "maxResults": 50,
            "type": "FACE_DETECTION"
          },
          {
            "maxResults": 50,
            "type": "OBJECT_LOCALIZATION"
          },
          {
            "maxResults": 50,
            "type": "LOGO_DETECTION"
          },
          {
            "maxResults": 50,
            "type": "LABEL_DETECTION"
          },
          {
            "maxResults": 50,
            "type": "DOCUMENT_TEXT_DETECTION"
          },
          {
            "maxResults": 50,
            "type": "SAFE_SEARCH_DETECTION"
          },
          {
            "maxResults": 50,
            "type": "IMAGE_PROPERTIES"
          },
          {
            "maxResults": 50,
            "type": "CROP_HINTS"
          },
          {
            "maxResults": 50,
            "type": "WEB_DETECTION"
          }
        ],
      }
    }

    const url = 'https://vision.googleapis.com/v1/images:annotate\?key\=AIzaSyBllaXKMoE5VRo8_NJh5Oras9bz80X0DHk';
    fetch(url, {
        method : 'POST',
        body: JSON.stringify(body)
    }).then(
        function(response) {
          return response.text();
        }
    ).then(
        function(html) {
          responses = JSON.parse(html).responses;

          responses.forEach(response => {
            response.localizedObjectAnnotations.forEach(localizedObjectAnnotation => {
              console.log("localizedObjectAnnotation", localizedObjectAnnotation)
              vertices = localizedObjectAnnotation.boundingPoly.normalizedVertices;
              ctx = cameraSensor.getContext('2d');
              ctx.fillStyle = '#f50';

              ctx.beginPath();
              ctx.moveTo(cameraSensor.width * vertices[0].x, cameraSensor.height * vertices[0].y);
              ctx.lineTo(cameraSensor.width * vertices[1].x, cameraSensor.height * vertices[1].y);
              ctx.lineTo(cameraSensor.width * vertices[2].x, cameraSensor.height * vertices[2].y);
              ctx.lineTo(cameraSensor.width * vertices[3].x, cameraSensor.height * vertices[3].y);
              ctx.closePath();
              ctx.strokeStyle = "#f50";
              ctx.lineWidth = 1;
              ctx.stroke();

              measureText = ctx.measureText(localizedObjectAnnotation.name);
              console.log("measureText", measureText)
              ctx.fillRect(cameraSensor.width * vertices[0].x, cameraSensor.height * vertices[0].y - 10, measureText.width + 10, 10);

              ctx.fillStyle = '#FFF';
              ctx.fillText(localizedObjectAnnotation.name, cameraSensor.width * vertices[0].x, cameraSensor.height * vertices[0].y);
            })
          });
        }
    );
};

// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
