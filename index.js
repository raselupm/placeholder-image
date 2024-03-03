const { createCanvas, registerFont } = require("canvas");
const path = require("node:path");
const express = require("express");
const app = express();

// Function to convert color to valid CSS format (name or hex code)
function getColorValue(color) {
  // Check if the color is a valid CSS color name
  const cssColorNames = [
    "black",
    "silver",
    "gray",
    "white",
    "maroon",
    "red",
    "purple",
    "fuchsia",
    "green",
    "lime",
    "olive",
    "yellow",
    "navy",
    "blue",
    "teal",
    "aqua",
  ];

  if (cssColorNames.includes(color.toLowerCase())) {
    return color.toLowerCase();
  } else {
    return "#" + color;
  }
}

app.get("/", (req, res) => {
  // serve index.html
  res.sendFile(__dirname + "/index.html");
});

app.get("/:dimensions", (req, res) => {
  // Parse URL parameters
  const { dimensions } = req.params;
  const [width, height] = dimensions.split("x");
  const { bg, text, textColor, fontSize, gradient, startColor, endColor, angle } = req.query;

  

  // Set default values
  const canvasWidth = parseInt(width) || 800;
  const canvasHeight = parseInt(height) || 400;
  const canvasBackgroundColor = getColorValue(bg || "eeeeee");
  const canvasTextColor = getColorValue(textColor || "000000");
  const canvasText = text || `${canvasWidth}x${canvasHeight}`;
  const defaultFontSize = Math.min(canvasWidth, canvasHeight) / 8;
  const canvasFontSize = fontSize || defaultFontSize;



  registerFont(path.resolve("./fonts/Helvetica.ttf"), { family: "Helvetica" });

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const gradientCtx = canvas.getContext("2d");

  // Set background color
  // ctx.fillStyle = canvasBackgroundColor;
  // ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // check if gradient is true
  if(gradient === "true") {
    // Create gradient
    const angleInRadians = angle * (Math.PI / 180);
    const x2 = canvasWidth * Math.cos(angleInRadians);
    const y2 = canvasHeight * Math.sin(angleInRadians);
    const gr = gradientCtx.createLinearGradient(0, 0, x2, y2);
    
    // add color stops
    gr.addColorStop(0, `#${startColor}`);
    gr.addColorStop(1, `#${endColor}`);
    
    // fill style with gradient
    gradientCtx.fillStyle = gr;
    gradientCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  }else {
    gradientCtx.fillStyle = canvasBackgroundColor;
    gradientCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Set text color and font
  gradientCtx.fillStyle = canvasTextColor;
  gradientCtx.font = `${canvasFontSize}px Helvetica`;


  // Measure text dimensions
  const textMetrics = gradientCtx.measureText(canvasText);
  const textWidth = textMetrics.width;
  const textHeight = canvasFontSize; // Assuming font size is 30px

  // Calculate position for horizontally and vertically centering
  const x = (canvasWidth - textWidth) / 2;
  const y = canvasHeight / 2 + textHeight / 2;

  // Draw text
  gradientCtx.fillText(canvasText, x, y);

  // Convert canvas to buffer
  const buffer = canvas.toBuffer(`image/png`);

  // Set response content type
  res.set("Content-Type", `image/png`);

  // Send the buffer as the response
  res.send(buffer);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
