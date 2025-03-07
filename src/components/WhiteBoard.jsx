import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import ColorPickerButton from './ColorPickerButton';

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
    socketRef.current.on('undo', (itemId) => {
      setItems(prev => prev.filter(item => item.id !== itemId));
    });
    // ADDED CODE: Undo socket listener
    
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

  const undoChange = () => {
    setItems(prev => {
      if (prev.length === 0) return prev;
      const removedItem = prev[prev.length - 1];
      socketRef.current.emit('undo', removedItem.id);
      return prev.slice(0, prev.length - 1);
    });
    redrawAll();
  };
  

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      <div className="relative w-full">
      <div className="absolute top-[50%] -translate-y-[50%]  flex flex-col gap-y-4">
        <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md text-black">
            <button
            onClick={() => setCurrentTool("select")
            }
            className="cursor-grab"
            >
              {currentTool === "select" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-2"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-2"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/></svg>
              )}
            </button>
            <button
            onClick={() => setCurrentTool("draw")}
            >
              {currentTool === "draw"? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              )}
            </button>
            <button
            onClick={() => { setItems([]); socketRef.current.emit('clear', { roomId }); }}
            >
            {currentTool === "clear" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
            ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
            )}
            </button>
            <button
            onClick={() => setCurrentTool("text")}
            >
            {currentTool === "text" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
            ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
            )}
            </button>
            <button
            onClick={() => setCurrentTool("square")}
            >
            {currentTool === "square" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            )}
            </button>
            <button
            onClick={() => setCurrentTool("circle")}>
              {currentTool === "circle"? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>
              ) :(
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>
              )}
            </button>
            <ColorPickerButton setColor={setColor}/>
            <button onClick={undoChange} >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
            </button>

        </div>
    </div>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-[calc(100vh-10rem)] bg-white border-2 border-gray-300 rounded"
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




