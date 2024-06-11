// App.tsx
import React, { useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModelAndDetect = async () => {
      const model = await cocoSsd.load();
      const video = videoRef.current;

      // Set up the webcam
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
          })
          .then((stream) => {
            if (video) {
              video.srcObject = stream;
              video.onloadedmetadata = () => {
                video.play();
                detectFrame(video, model);
              };
            }
          })
          .catch((error) => {
            console.error("Error accessing webcam:", error);
          });
      }
    };

    const detectFrame = (
      video: HTMLVideoElement,
      model: cocoSsd.ObjectDetection
    ) => {
      model.detect(video).then((predictions) => {
        renderPredictions(predictions);
        requestAnimationFrame(() => {
          detectFrame(video, model);
        });
      });
    };

    const renderPredictions = (predictions: cocoSsd.DetectedObject[]) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const video = videoRef.current;

      if (ctx && video) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "green";
          ctx.fillStyle = "green";
          ctx.stroke();
          ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 10 ? y - 5 : 10
          );
        });
      }
    };

    loadModelAndDetect();
  }, []);

  return (
    <div>
      <h1>Object Detection App</h1>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        width="640"
        height="480"
        autoPlay
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};

export default App;
