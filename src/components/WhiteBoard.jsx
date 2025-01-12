import React, { useState, useRef, useEffect } from 'react';
import {io} from 'socket.io-client';

const Whiteboard = ({roomId = 'default-room'}) => {
const canvasRef = useRef(null);
const [isDrawing, setIsDrawing] = useState(false);
const [color, setColor] = useState('#000000');
const [lineWidth, setLineWidth] = useState(2);
const contextRef = useRef(null);
const socketRef = useRef(null);
const {userCount, setUserCount} = useState(1);
const lastPositionRef = useRef(null);

useEffect(() => {

    socketRef.current = io('http://localhost:4000', {
        query: { roomId }
    });

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    socketRef.current.on('draw', drawLine);
    socketRef.current.on('clear', clearCanvas);
    socketRef.current.on('userCount', count => setUserCount(count));

    return () => {
    socketRef.current.disconnect();
    };
}, []);

const drawLine = (data) => {
    const { x0, y0, x1, y1, color, lineWidth } = data;
    const context = contextRef.current;
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    //context.closePath();
};

const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    lastPositionRef.current = { x: offsetX, y: offsetY };
};

const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const lastPos = lastPositionRef.current;
    // contextRef.current.lineTo(offsetX, offsetY);
    // contextRef.current.stroke();
    // const x0 = offsetX;
    // const y0 = offsetY;
    // const x1 = offsetX;
    // const y1 = offsetY;

    // drawLine({
    //     x0: x0,
    //     y0: y0,
    //     x1: x1,
    //     y1: y1,
    //     color,
    //     lineWidth
    // });
    
    drawLine({
      x0: lastPos.x,
      y0: lastPos.y,
      x1: offsetX,
      y1: offsetY,
      color,
      lineWidth
    });
    socketRef.current.emit('draw', {
      x0: lastPos.x,
      y0: lastPos.y,
      x1: offsetX,
      y1: offsetY,
        color,
        lineWidth,
        roomId
    });

    lastPositionRef.current = { x: offsetX, y: offsetY };

};

const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    lastPositionRef.current = null;
};

const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    socketRef.current.emit('clear', { roomId });
};

const updateColor = (newColor) => {
    setColor(newColor);
    contextRef.current.strokeStyle = newColor;
};

const updateLineWidth = (newWidth) => {
    setLineWidth(newWidth);
    contextRef.current.lineWidth = newWidth;
};

return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      <div className="flex gap-4 mb-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
        <select
          onChange={(e) => updateLineWidth(parseInt(e.target.value))}
          value={lineWidth}
          className="px-2 py-2 border rounded"
        >
          <option value="2">Thin</option>
          <option value="4">Medium</option>
          <option value="6">Thick</option>
        </select>
        <input
          type="color"
          value={color}
          onChange={(e) => updateColor(e.target.value)}
          className="w-12 h-10 cursor-pointer"
        />
        <div className="text-sm text-gray-600">
          {userCount} user{userCount !== 1 ? 's' : ''} connected
        </div>
      </div>
    <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-[calc(100vh-14rem)]  bg-white border-2 border-gray-300 rounded cursor-crosshair"
    />
    </div>
  );
};

export default Whiteboard;