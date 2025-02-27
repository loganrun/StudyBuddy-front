import React, { useState, useRef, useEffect } from 'react';

import { io } from 'socket.io-client';
import { WbToolbar } from './WbToolbar';

const Whiteboard = ({ roomId }) => {
  // Tools: "draw", "text", "circle", "square", "select"
  const [currentTool, setCurrentTool] = useState("draw");
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  // items holds all drawn objects (strokes, shapes, text)
  const [items, setItems] = useState([]);
  // For text mode: when user clicks, show an input overlay.
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });
  // For drawing freehand strokes.
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  // For shape (circle/square) preview.
  const [shapeStart, setShapeStart] = useState(null);
  // For selection mode.
  const [selectedItem, setSelectedItem] = useState(null); // { id, offsetX, offsetY }
  const [dragging, setDragging] = useState(false);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const socketRef = useRef(null);
  const [userCount, setUserCount] = useState(1);

  // Generate a unique id for each item.
  const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    socketRef.current = io('http://localhost:4000', { query: { roomId } });

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    socketRef.current.emit('joinRoom', { roomId });
    // When a new item is created by another client.
    socketRef.current.on('newItem', (item) => {
      setItems(prev => [...prev, item]);
    });
    // When an item is moved by another client.
    socketRef.current.on('updateItem', (updatedItem) => {
      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    });
    socketRef.current.on('clear', () => {
      setItems([]);
      redrawAll();
    });
    socketRef.current.on('userCount', count => setUserCount(count));

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Redraw canvas whenever items change.
  useEffect(() => {
    redrawAll();
  }, [items]);

  // Clears the canvas and draws every stored item.
  const redrawAll = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach(item => drawItem(ctx, item));
  };

  // Draw an individual item.
  const drawItem = (ctx, item) => {
    ctx.save();
    if (item.type === "stroke") {
      ctx.beginPath();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.lineWidth;
      const points = item.points;
      if (points.length) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
    } else if (item.type === "circle") {
      ctx.beginPath();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.lineWidth;
      ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (item.type === "square") {
      ctx.beginPath();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.lineWidth;
      ctx.rect(item.x, item.y, item.size, item.size);
      ctx.stroke();
    } else if (item.type === "text") {
      ctx.fillStyle = item.color;
      ctx.font = item.font;
      ctx.fillText(item.text, item.x, item.y);
    }
    ctx.restore();
  };

  // Simple hit test: returns true if point (x, y) is “close” to the item.
  const hitTest = (x, y, item) => {
    const threshold = 5;
    if (item.type === "stroke") {
      for (let p of item.points) {
        if (Math.hypot(p.x - x, p.y - y) < threshold) return true;
      }
    } else if (item.type === "circle") {
      const dist = Math.hypot(item.x - x, item.y - y);
      if (dist < item.radius + threshold) return true;
    } else if (item.type === "square") {
      if (x >= item.x && x <= item.x + item.size && y >= item.y && y <= item.y + item.size) return true;
    } else if (item.type === "text") {
      // Approximate bounding box: width based on text length and a fixed height.
      const width = item.text.length * 8;
      const height = 20;
      if (x >= item.x && x <= item.x + width && y >= item.y - height && y <= item.y) return true;
    }
    return false;
  };

  // Mouse down event: start drawing, shape, or selection.
  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (currentTool === "draw") {
      const newStroke = {
        id: generateId(),
        type: "stroke",
        points: [{ x: offsetX, y: offsetY }],
        color,
        lineWidth,
      };
      setCurrentStroke(newStroke);
      setIsDrawing(true);
    } else if (currentTool === "circle" || currentTool === "square") {
      setShapeStart({ x: offsetX, y: offsetY });
    } else if (currentTool === "select") {
      // Check items in reverse order (topmost first).
      for (let i = items.length - 1; i >= 0; i--) {
        if (hitTest(offsetX, offsetY, items[i])) {
          setSelectedItem({ id: items[i].id, offsetX: offsetX - items[i].x, offsetY: offsetY - items[i].y });
          setDragging(true);
          break;
        }
      }
    }
  };

  // Mouse move event: update current stroke, preview shape, or drag a selected item.
  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = contextRef.current;
    if (currentTool === "draw" && isDrawing && currentStroke) {
      const updatedStroke = { ...currentStroke, points: [...currentStroke.points, { x: offsetX, y: offsetY }] };
      setCurrentStroke(updatedStroke);
      redrawAll();
      drawItem(ctx, updatedStroke);
    } else if ((currentTool === "circle" || currentTool === "square") && shapeStart) {
      // Preview shape by redrawing the canvas plus the shape outline.
      redrawAll();
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (currentTool === "circle") {
        const dx = offsetX - shapeStart.x;
        const dy = offsetY - shapeStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath();
        ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === "square") {
        const dx = offsetX - shapeStart.x;
        const dy = offsetY - shapeStart.y;
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        const x = dx < 0 ? shapeStart.x - size : shapeStart.x;
        const y = dy < 0 ? shapeStart.y - size : shapeStart.y;
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.stroke();
      }
      ctx.restore();
    } else if (currentTool === "select" && dragging && selectedItem) {
      // Move the selected item.
      setItems(prev =>
        prev.map(item => {
          if (item.id === selectedItem.id) {
            const newX = offsetX - selectedItem.offsetX;
            const newY = offsetY - selectedItem.offsetY;
            if (item.type === "stroke") {
              // Shift every point by the same delta.
              const deltaX = newX - item.points[0].x;
              const deltaY = newY - item.points[0].y;
              const newPoints = item.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
              return { ...item, points: newPoints };
            } else {
              return { ...item, x: newX, y: newY };
            }
          }
          return item;
        })
      );
      redrawAll();
    }
  };

  // Mouse up event: finalize the current action.
  const handleMouseUp = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (currentTool === "draw" && isDrawing && currentStroke) {
      const finalizedStroke = { ...currentStroke };
      setItems(prev => [...prev, finalizedStroke]);
      socketRef.current.emit('newItem', finalizedStroke);
      setCurrentStroke(null);
      setIsDrawing(false);
    } else if ((currentTool === "circle" || currentTool === "square") && shapeStart) {
      let newItem;
      if (currentTool === "circle") {
        const dx = offsetX - shapeStart.x;
        const dy = offsetY - shapeStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        newItem = { id: generateId(), type: "circle", x: shapeStart.x, y: shapeStart.y, radius, color, lineWidth };
      } else {
        const dx = offsetX - shapeStart.x;
        const dy = offsetY - shapeStart.y;
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        const x = dx < 0 ? shapeStart.x - size : shapeStart.x;
        const y = dy < 0 ? shapeStart.y - size : shapeStart.y;
        newItem = { id: generateId(), type: "square", x, y, size, color, lineWidth };
      }
      setItems(prev => [...prev, newItem]);
      socketRef.current.emit('newItem', newItem);
      setShapeStart(null);
      redrawAll();
    } else if (currentTool === "select" && dragging) {
      // Finalize selection movement.
      if (selectedItem) {
        const movedItem = items.find(item => item.id === selectedItem.id);
        if (movedItem) {
          socketRef.current.emit('updateItem', movedItem);
        }
      }
      setDragging(false);
      setSelectedItem(null);
    }
  };

  // New: onClick handler for text mode. When currentTool is "text", a click shows the input overlay.
  const handleCanvasClick = (e) => {
    if (currentTool !== "text") return;
    const { offsetX, offsetY } = e.nativeEvent;
    setTextInput({ visible: true, x: offsetX, y: offsetY, value: '' });
  };

  // Commit text input: create a text item and emit it.
  const commitText = () => {
    if (textInput.value.trim() === '') {
      setTextInput({ ...textInput, visible: false, value: '' });
      return;
    }
    const newTextItem = {
      id: generateId(),
      type: "text",
      x: textInput.x,
      y: textInput.y,
      text: textInput.value,
      color,
      font: "16px sans-serif"
    };
    setItems(prev => [...prev, newTextItem]);
    socketRef.current.emit('newItem', newTextItem);
    setTextInput({ ...textInput, visible: false, value: '' });
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={() => { setItems([]); socketRef.current.emit('clear', { roomId }); }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
        <select
          onChange={(e) => setLineWidth(parseInt(e.target.value))}
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
          onChange={(e) => setColor(e.target.value)}
          className="w-12 h-10 cursor-pointer"
        />
        <div className="text-sm text-gray-600">
          {userCount} user{userCount !== 1 ? 's' : ''} connected
        </div>
        <button onClick={() => setCurrentTool("draw")} className={`px-4 py-2 rounded ${currentTool==="draw"?"bg-blue-600 text-white":"bg-gray-300"}`}>Draw</button>
        <button onClick={() => setCurrentTool("text")} className={`px-4 py-2 rounded ${currentTool==="text"?"bg-blue-600 text-white":"bg-gray-300"}`}>Text</button>
        <button onClick={() => setCurrentTool("circle")} className={`px-4 py-2 rounded ${currentTool==="circle"?"bg-blue-600 text-white":"bg-gray-300"}`}>Circle</button>
        <button onClick={() => setCurrentTool("square")} className={`px-4 py-2 rounded ${currentTool==="square"?"bg-blue-600 text-white":"bg-gray-300"}`}>Square</button>
        <button onClick={() => setCurrentTool("select")} className={`px-4 py-2 rounded ${currentTool==="select"?"bg-blue-600 text-white":"bg-gray-300"}`}>Select</button>
      </div>
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-[calc(100vh-14rem)] bg-white border-2 border-gray-300 rounded cursor-crosshair"
        />
        {textInput.visible && (
          <input
            type="text"
            autoFocus
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onBlur={commitText}
            onKeyDown={(e) => { if (e.key === 'Enter') commitText(); }}
            className="absolute font-sans text-base border border-black p-[2px] bg-white/80 text-black"
            style={{ left: textInput.x, top: textInput.y }}
          />
        )}
      </div>
    </div>
  );
};

export default Whiteboard;


// import React, { useState, useRef, useEffect } from 'react';
// import { io } from 'socket.io-client';

// const Whiteboard = ({ roomId }) => {
//   // Tools: "draw", "text", "circle", "square", "select"
//   const [currentTool, setCurrentTool] = useState("draw");
//   const [color, setColor] = useState('#000000');
//   const [lineWidth, setLineWidth] = useState(2);
//   // items holds all drawn objects (strokes, shapes, text)
//   const [items, setItems] = useState([]);
//   // For text mode: when user clicks, show an input overlay.
//   const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });
//   // For drawing freehand strokes.
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [currentStroke, setCurrentStroke] = useState(null);
//   // For shape (circle/square) preview.
//   const [shapeStart, setShapeStart] = useState(null);
//   // For selection mode.
//   const [selectedItem, setSelectedItem] = useState(null); // { id, offsetX, offsetY }
//   const [dragging, setDragging] = useState(false);

//   const canvasRef = useRef(null);
//   const contextRef = useRef(null);
//   const socketRef = useRef(null);
//   const [userCount, setUserCount] = useState(1);

//   // Generate a unique id for each item.
//   const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

//   useEffect(() => {
//     socketRef.current = io('http://localhost:4000', { query: { roomId } });

//     const canvas = canvasRef.current;
//     canvas.width = canvas.offsetWidth * 2;
//     canvas.height = canvas.offsetHeight * 2;
//     const context = canvas.getContext('2d');
//     context.scale(2, 2);
//     context.lineCap = 'round';
//     context.strokeStyle = color;
//     context.lineWidth = lineWidth;
//     contextRef.current = context;

//     socketRef.current.emit('joinRoom', { roomId });
//     // When a new item is created by another client.
//     socketRef.current.on('newItem', (item) => {
//       setItems(prev => [...prev, item]);
//     });
//     // When an item is moved by another client.
//     socketRef.current.on('updateItem', (updatedItem) => {
//       setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
//     });
//     socketRef.current.on('clear', () => {
//       setItems([]);
//       redrawAll();
//     });
//     socketRef.current.on('userCount', count => setUserCount(count));

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   // Redraw canvas whenever items change.
//   useEffect(() => {
//     redrawAll();
//   }, [items]);

//   // Clears the canvas and draws every stored item.
//   const redrawAll = () => {
//     const canvas = canvasRef.current;
//     const ctx = contextRef.current;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     items.forEach(item => drawItem(ctx, item));
//   };

//   // Draw an individual item.
//   const drawItem = (ctx, item) => {
//     ctx.save();
//     if (item.type === "stroke") {
//       ctx.beginPath();
//       ctx.strokeStyle = item.color;
//       ctx.lineWidth = item.lineWidth;
//       const points = item.points;
//       if (points.length) {
//         ctx.moveTo(points[0].x, points[0].y);
//         for (let i = 1; i < points.length; i++) {
//           ctx.lineTo(points[i].x, points[i].y);
//         }
//         ctx.stroke();
//       }
//     } else if (item.type === "circle") {
//       ctx.beginPath();
//       ctx.strokeStyle = item.color;
//       ctx.lineWidth = item.lineWidth;
//       ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
//       ctx.stroke();
//     } else if (item.type === "square") {
//       ctx.beginPath();
//       ctx.strokeStyle = item.color;
//       ctx.lineWidth = item.lineWidth;
//       ctx.rect(item.x, item.y, item.size, item.size);
//       ctx.stroke();
//     } else if (item.type === "text") {
//       ctx.fillStyle = item.color;
//       ctx.font = item.font;
//       ctx.fillText(item.text, item.x, item.y);
//     }
//     ctx.restore();
//   };

//   // Simple hit test: returns true if point (x, y) is “close” to the item.
//   const hitTest = (x, y, item) => {
//     const threshold = 5;
//     if (item.type === "stroke") {
//       for (let p of item.points) {
//         if (Math.hypot(p.x - x, p.y - y) < threshold) return true;
//       }
//     } else if (item.type === "circle") {
//       const dist = Math.hypot(item.x - x, item.y - y);
//       if (dist < item.radius + threshold) return true;
//     } else if (item.type === "square") {
//       if (x >= item.x && x <= item.x + item.size && y >= item.y && y <= item.y + item.size) return true;
//     } else if (item.type === "text") {
//       // Approximate bounding box: width based on text length and a fixed height.
//       const width = item.text.length * 8;
//       const height = 20;
//       if (x >= item.x && x <= item.x + width && y >= item.y - height && y <= item.y) return true;
//     }
//     return false;
//   };

//   // Mouse down event: start drawing, shape, or selection.
//   const handleMouseDown = (e) => {
//     const { offsetX, offsetY } = e.nativeEvent;
//     if (currentTool === "draw") {
//       const newStroke = {
//         id: generateId(),
//         type: "stroke",
//         points: [{ x: offsetX, y: offsetY }],
//         color,
//         lineWidth,
//       };
//       setCurrentStroke(newStroke);
//       setIsDrawing(true);
//     } else if (currentTool === "circle" || currentTool === "square") {
//       setShapeStart({ x: offsetX, y: offsetY });
//     } else if (currentTool === "text") {
//       setTextInput({ visible: true, x: offsetX, y: offsetY, value: '' });
//     } else if (currentTool === "select") {
//       // Check items in reverse order (topmost first).
//       for (let i = items.length - 1; i >= 0; i--) {
//         if (hitTest(offsetX, offsetY, items[i])) {
//           setSelectedItem({ id: items[i].id, offsetX: offsetX - items[i].x, offsetY: offsetY - items[i].y });
//           setDragging(true);
//           break;
//         }
//       }
//     }
//   };

//   // Mouse move event: update current stroke, preview shape, or drag a selected item.
//   const handleMouseMove = (e) => {
//     const { offsetX, offsetY } = e.nativeEvent;
//     const ctx = contextRef.current;
//     if (currentTool === "draw" && isDrawing && currentStroke) {
//       const updatedStroke = { ...currentStroke, points: [...currentStroke.points, { x: offsetX, y: offsetY }] };
//       setCurrentStroke(updatedStroke);
//       redrawAll();
//       drawItem(ctx, updatedStroke);
//     } else if ((currentTool === "circle" || currentTool === "square") && shapeStart) {
//       // Preview shape by redrawing the canvas plus the shape outline.
//       redrawAll();
//       ctx.save();
//       ctx.strokeStyle = color;
//       ctx.lineWidth = lineWidth;
//       if (currentTool === "circle") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const radius = Math.sqrt(dx * dx + dy * dy);
//         ctx.beginPath();
//         ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
//         ctx.stroke();
//       } else if (currentTool === "square") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const size = Math.max(Math.abs(dx), Math.abs(dy));
//         const x = dx < 0 ? shapeStart.x - size : shapeStart.x;
//         const y = dy < 0 ? shapeStart.y - size : shapeStart.y;
//         ctx.beginPath();
//         ctx.rect(x, y, size, size);
//         ctx.stroke();
//       }
//       ctx.restore();
//     } else if (currentTool === "select" && dragging && selectedItem) {
//       // Move the selected item.
//       setItems(prev =>
//         prev.map(item => {
//           if (item.id === selectedItem.id) {
//             const newX = offsetX - selectedItem.offsetX;
//             const newY = offsetY - selectedItem.offsetY;
//             if (item.type === "stroke") {
//               // Shift every point by the same delta.
//               const deltaX = newX - item.points[0].x;
//               const deltaY = newY - item.points[0].y;
//               const newPoints = item.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
//               return { ...item, points: newPoints };
//             } else {
//               return { ...item, x: newX, y: newY };
//             }
//           }
//           return item;
//         })
//       );
//       redrawAll();
//     }
//   };

//   // Mouse up event: finalize the current action.
//   const handleMouseUp = (e) => {
//     const { offsetX, offsetY } = e.nativeEvent;
//     if (currentTool === "draw" && isDrawing && currentStroke) {
//       const finalizedStroke = { ...currentStroke };
//       setItems(prev => [...prev, finalizedStroke]);
//       socketRef.current.emit('newItem', finalizedStroke);
//       setCurrentStroke(null);
//       setIsDrawing(false);
//     } else if ((currentTool === "circle" || currentTool === "square") && shapeStart) {
//       let newItem;
//       if (currentTool === "circle") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const radius = Math.sqrt(dx * dx + dy * dy);
//         newItem = { id: generateId(), type: "circle", x: shapeStart.x, y: shapeStart.y, radius, color, lineWidth };
//       } else {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const size = Math.max(Math.abs(dx), Math.abs(dy));
//         const x = dx < 0 ? shapeStart.x - size : shapeStart.x;
//         const y = dy < 0 ? shapeStart.y - size : shapeStart.y;
//         newItem = { id: generateId(), type: "square", x, y, size, color, lineWidth };
//       }
//       setItems(prev => [...prev, newItem]);
//       socketRef.current.emit('newItem', newItem);
//       setShapeStart(null);
//       redrawAll();
//     } else if (currentTool === "select" && dragging) {
//       // Finalize selection movement.
//       if (selectedItem) {
//         const movedItem = items.find(item => item.id === selectedItem.id);
//         if (movedItem) {
//           socketRef.current.emit('updateItem', movedItem);
//         }
//       }
//       setDragging(false);
//       setSelectedItem(null);
//     }
//   };

//   // When in text mode, the click shows an overlay input.
//   const commitText = () => {
//     if (textInput.value.trim() === '') {
//       setTextInput({ ...textInput, visible: false, value: '' });
//       return;
//     }
//     const newTextItem = {
//       id: generateId(),
//       type: "text",
//       x: textInput.x,
//       y: textInput.y,
//       text: textInput.value,
//       color,
//       font: "16px sans-serif"
//     };
//     setItems(prev => [...prev, newTextItem]);
//     socketRef.current.emit('newItem', newTextItem);
//     setTextInput({ ...textInput, visible: false, value: '' });
//   };

//   return (
//     <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
//       <div className="flex flex-wrap gap-4 mb-4">
//         <button
//           onClick={() => { setItems([]); socketRef.current.emit('clear', { roomId }); }}
//           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           Clear
//         </button>
//         <select
//           onChange={(e) => { setLineWidth(parseInt(e.target.value)); }}
//           value={lineWidth}
//           className="px-2 py-2 border rounded"
//         >
//           <option value="2">Thin</option>
//           <option value="4">Medium</option>
//           <option value="6">Thick</option>
//         </select>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="w-12 h-10 cursor-pointer"
//         />
//         <div className="text-sm text-gray-600">
//           {userCount} user{userCount !== 1 ? 's' : ''} connected
//         </div>
//         <button onClick={() => setCurrentTool("draw")} className={`px-4 py-2 rounded ${currentTool==="draw"?"bg-blue-600 text-white":"bg-gray-300"}`}>Draw</button>
//         <button onClick={() => setCurrentTool("text")} className={`px-4 py-2 rounded ${currentTool==="text"?"bg-blue-600 text-white":"bg-gray-300"}`}>Text</button>
//         <button onClick={() => setCurrentTool("circle")} className={`px-4 py-2 rounded ${currentTool==="circle"?"bg-blue-600 text-white":"bg-gray-300"}`}>Circle</button>
//         <button onClick={() => setCurrentTool("square")} className={`px-4 py-2 rounded ${currentTool==="square"?"bg-blue-600 text-white":"bg-gray-300"}`}>Square</button>
//         <button onClick={() => setCurrentTool("select")} className={`px-4 py-2 rounded ${currentTool==="select"?"bg-blue-600 text-white":"bg-gray-300"}`}>Select</button>
//       </div>
//       <div className="relative w-full">
//         <canvas
//           ref={canvasRef}
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseUp}
//           className="w-full h-[calc(100vh-14rem)] bg-white border-2 border-gray-300 rounded cursor-crosshair"
//         />
//         {textInput.visible && (
//           <input
//             type="text"
//             autoFocus
//             value={textInput.value}
//             onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
//             onBlur={commitText}
//             onKeyDown={(e) => { if(e.key === 'Enter') commitText(); }}
//             className="absolute font-sans text-base border border-black p-[2px] bg-white/80"
//             style={{ left: textInput.x, top: textInput.y }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;


// import React, { useState, useRef, useEffect } from 'react';
// import { io } from 'socket.io-client';

// const Whiteboard = ({ roomId }) => {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [color, setColor] = useState('#000000');
//   const [lineWidth, setLineWidth] = useState(2);
//   // currentTool can be "draw", "text", "circle", or "square"
//   const [currentTool, setCurrentTool] = useState("draw");
//   // State for text input overlay (only used in text mode)
//   const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });
//   // For shape drawing (circle and square)
//   const [shapeStart, setShapeStart] = useState(null);
//   const shapeImageRef = useRef(null);

//   const contextRef = useRef(null);
//   const socketRef = useRef(null);
//   const [userCount, setUserCount] = useState(1);
//   const lastPositionRef = useRef(null);

//   useEffect(() => {
//     socketRef.current = io('http://localhost:4000', {
//       query: { roomId },
//     });

//     const canvas = canvasRef.current;
//     canvas.width = canvas.offsetWidth * 2;
//     canvas.height = canvas.offsetHeight * 2;
    
//     const context = canvas.getContext('2d');
//     context.scale(2, 2);
//     context.lineCap = 'round';
//     context.strokeStyle = color;
//     context.lineWidth = lineWidth;
//     contextRef.current = context;

//     socketRef.current.emit('joinRoom', { roomId });
//     socketRef.current.on('draw', drawLine);
//     socketRef.current.on('clear', clearCanvas);
//     socketRef.current.on('text', handleIncomingText);
//     socketRef.current.on('shape', handleIncomingShape);
//     socketRef.current.on('userCount', count => setUserCount(count));

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   // Free-hand drawing function (used in "draw" mode)
//   const drawLine = (data) => {
//     const { x0, y0, x1, y1, color, lineWidth } = data;
//     const context = contextRef.current;
//     context.beginPath();
//     context.strokeStyle = color;
//     context.lineWidth = lineWidth;
//     context.moveTo(x0, y0);
//     context.lineTo(x1, y1);
//     context.stroke();
//   };

//   // onMouseDown handles free drawing as well as shape starting
//   const startDrawing = ({ nativeEvent }) => {
//     if (currentTool === "draw") {
//       const { offsetX, offsetY } = nativeEvent;
//       contextRef.current.beginPath();
//       contextRef.current.moveTo(offsetX, offsetY);
//       setIsDrawing(true);
//       lastPositionRef.current = { x: offsetX, y: offsetY };
//     } else if (currentTool === "circle" || currentTool === "square") {
//       const { offsetX, offsetY } = nativeEvent;
//       setShapeStart({ x: offsetX, y: offsetY });
//       const canvas = canvasRef.current;
//       // Save the current canvas image to allow a preview
//       shapeImageRef.current = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
//     }
//   };

//   // onMouseMove handles free drawing and shape previewing
//   const handleMouseMove = ({ nativeEvent }) => {
//     if (currentTool === "draw" && isDrawing) {
//       const { offsetX, offsetY } = nativeEvent;
//       const lastPos = lastPositionRef.current;
//       drawLine({
//         x0: lastPos.x,
//         y0: lastPos.y,
//         x1: offsetX,
//         y1: offsetY,
//         color,
//         lineWidth,
//       });
//       socketRef.current.emit('draw', {
//         x0: lastPos.x,
//         y0: lastPos.y,
//         x1: offsetX,
//         y1: offsetY,
//         color,
//         lineWidth,
//         roomId,
//       });
//       lastPositionRef.current = { x: offsetX, y: offsetY };
//     } else if ((currentTool === "circle" || currentTool === "square") && shapeStart) {
//       // Restore canvas state and draw a preview of the shape
//       const canvas = canvasRef.current;
//       contextRef.current.putImageData(shapeImageRef.current, 0, 0);
//       const { offsetX, offsetY } = nativeEvent;
//       if (currentTool === "circle") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const radius = Math.sqrt(dx * dx + dy * dy);
//         contextRef.current.beginPath();
//         contextRef.current.strokeStyle = color;
//         contextRef.current.lineWidth = lineWidth;
//         contextRef.current.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
//         contextRef.current.stroke();
//       } else if (currentTool === "square") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const size = Math.max(Math.abs(dx), Math.abs(dy));
//         const x = dx < 0 ? shapeStart.x - size : shapeStart.x;
//         const y = dy < 0 ? shapeStart.y - size : shapeStart.y;
//         contextRef.current.beginPath();
//         contextRef.current.strokeStyle = color;
//         contextRef.current.lineWidth = lineWidth;
//         contextRef.current.rect(x, y, size, size);
//         contextRef.current.stroke();
//       }
//     }
//   };

//   // onMouseUp commits the drawing or shape
//   const stopDrawing = (event) => {
//     if (currentTool === "draw") {
//       contextRef.current.closePath();
//       setIsDrawing(false);
//       lastPositionRef.current = null;
//     } else if ((currentTool === "circle" || currentTool === "square") && shapeStart) {
//       const { offsetX, offsetY } = event.nativeEvent;
//       let shapeData;
//       if (currentTool === "circle") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const radius = Math.sqrt(dx * dx + dy * dy);
//         contextRef.current.beginPath();
//         contextRef.current.strokeStyle = color;
//         contextRef.current.lineWidth = lineWidth;
//         contextRef.current.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
//         contextRef.current.stroke();
//         shapeData = { type: 'circle', x: shapeStart.x, y: shapeStart.y, radius, color, lineWidth };
//       } else if (currentTool === "square") {
//         const dx = offsetX - shapeStart.x;
//         const dy = offsetY - shapeStart.y;
//         const size = Math.max(Math.abs(dx), Math.abs(dy));
//         const x = dx < 0 ? shapeStart.x - size : shapeStart.x;
//         const y = dy < 0 ? shapeStart.y - size : shapeStart.y;
//         contextRef.current.beginPath();
//         contextRef.current.strokeStyle = color;
//         contextRef.current.lineWidth = lineWidth;
//         contextRef.current.rect(x, y, size, size);
//         contextRef.current.stroke();
//         shapeData = { type: 'square', x, y, size, color, lineWidth };
//       }
//       socketRef.current.emit('shape', { ...shapeData, roomId });
//       setShapeStart(null);
//     }
//   };

//   // In text mode, clicking the canvas shows an input overlay at the click location.
//   const handleCanvasClickForText = ({ nativeEvent }) => {
//     if (currentTool !== "text") return;
//     const { offsetX, offsetY } = nativeEvent;
//     setTextInput({ visible: true, x: offsetX, y: offsetY, value: '' });
//   };

//   // Commit text input: render on canvas and emit the text event.
//   const commitText = () => {
//     if (textInput.value.trim() === '') {
//       setTextInput({ ...textInput, visible: false, value: '' });
//       return;
//     }
//     const context = contextRef.current;
//     context.fillStyle = color;
//     context.font = "16px sans-serif";
//     context.fillText(textInput.value, textInput.x, textInput.y);

//     socketRef.current.emit('text', {
//       x: textInput.x,
//       y: textInput.y,
//       text: textInput.value,
//       color,
//       font: "16px sans-serif",
//       roomId,
//     });
//     setTextInput({ ...textInput, visible: false, value: '' });
//   };

//   // Socket listener for incoming text events.
//   const handleIncomingText = (data) => {
//     const { x, y, text, color, font } = data;
//     const context = contextRef.current;
//     context.fillStyle = color;
//     context.font = font;
//     context.fillText(text, x, y);
//   };

//   // Socket listener for incoming shape events.
//   const handleIncomingShape = (data) => {
//     const { type, color, lineWidth } = data;
//     const context = contextRef.current;
//     context.strokeStyle = color;
//     context.lineWidth = lineWidth;
//     context.beginPath();
//     if (type === 'circle') {
//       const { x, y, radius } = data;
//       context.arc(x, y, radius, 0, 2 * Math.PI);
//     } else if (type === 'square') {
//       const { x, y, size } = data;
//       context.rect(x, y, size, size);
//     }
//     context.stroke();
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');
//     context.fillStyle = 'white';
//     context.fillRect(0, 0, canvas.width, canvas.height);
//     socketRef.current.emit('clear', { roomId });
//   };

//   const updateColor = (newColor) => {
//     setColor(newColor);
//     contextRef.current.strokeStyle = newColor;
//   };

//   const updateLineWidth = (newWidth) => {
//     setLineWidth(newWidth);
//     contextRef.current.lineWidth = newWidth;
//   };

//   return (
//     <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
//       <div className="flex flex-wrap gap-4 mb-4">
//         <button
//           onClick={clearCanvas}
//           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           Clear
//         </button>
//         <select
//           onChange={(e) => updateLineWidth(parseInt(e.target.value))}
//           value={lineWidth}
//           className="px-2 py-2 border rounded"
//         >
//           <option value="2">Thin</option>
//           <option value="4">Medium</option>
//           <option value="6">Thick</option>
//         </select>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => updateColor(e.target.value)}
//           className="w-12 h-10 cursor-pointer"
//         />
//         <div className="text-sm text-gray-600">
//           {userCount} user{userCount !== 1 ? 's' : ''} connected
//         </div>
//         {/* Tool selection buttons */}
//         <button
//           onClick={() => setCurrentTool("draw")}
//           className={`px-4 py-2 rounded ${currentTool === "draw" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
//         >
//           Draw
//         </button>
//         <button
//           onClick={() => setCurrentTool("text")}
//           className={`px-4 py-2 rounded ${currentTool === "text" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
//         >
//           Text
//         </button>
//         <button
//           onClick={() => setCurrentTool("circle")}
//           className={`px-4 py-2 rounded ${currentTool === "circle" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
//         >
//           Circle
//         </button>
//         <button
//           onClick={() => setCurrentTool("square")}
//           className={`px-4 py-2 rounded ${currentTool === "square" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
//         >
//           Square
//         </button>
//       </div>
//       <div className="relative w-full">
//         <canvas
//           ref={canvasRef}
//           onMouseDown={startDrawing}
//           onMouseMove={handleMouseMove}
//           onMouseUp={stopDrawing}
//           onMouseLeave={stopDrawing}
//           onClick={handleCanvasClickForText}
//           className="w-full h-[calc(100vh-14rem)] bg-white border-2 border-gray-300 rounded cursor-crosshair"
//         />
//         {textInput.visible && (
//           <input
//             type="text"
//             autoFocus
//             value={textInput.value}
//             onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
//             onBlur={commitText}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') commitText();
//             }}
//             className="absolute font-sans text-base border border-black p-[2px] bg-white/80"
//             style={{ left: textInput.x, top: textInput.y }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;

