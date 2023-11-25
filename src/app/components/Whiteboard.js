import React, { Component, createRef, useRef, useEffect, forwardRef } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import "./styles/whiteboard.scss";
import { atom, useAtom } from 'jotai';
import { sizeAtom, colorAtom, fillAtom, fillColorAtom, charsAtom, fontFamilyAtom, fontSizeAtom, textboxVisibilityAtom, clearAtom, undoAtom, redoAtom, itemsAtom, undoListAtom, redoListAtom, widthAtom, heightAtom, toolTypeAtom } from './whtBdPage.js';
import { v4 } from 'uuid';

const animateAtom = atom(true);

let stroke = null;
let listItems = [];
let line = null;
let rectangle = null;
let ellipse = null;
let imageData = null;
let textChars = null;

var preventDefault = function(e){
    e.preventDefault();
};

const Whiteboard = forwardRef((props, ref) => {

	const [size, setSize] = useAtom(sizeAtom);
  const [color, setColor] = useAtom(colorAtom);
  const [fill, setFill] = useAtom(fillAtom);
  const [fillColor, setFillColor] = useAtom(fillColorAtom);
  const [chars, setChars] = useAtom(charsAtom);
  const [fontFamily, setFontFamily] = useAtom(fontFamilyAtom);
  const [fontSize, setFontSize] = useAtom(fontSizeAtom);
  const [textboxVisibility, setTextboxVisibility] = useAtom(textboxVisibilityAtom);
  const [clear, setClear] = useAtom(clearAtom);
  const [undo, setUndo] = useAtom(undoAtom);
  const [redo, setRedo] = useAtom(redoAtom);
  const [items, setItems] = useAtom(itemsAtom);
  const [redoList, setRedoList] = useAtom(redoListAtom);
  const [width, setWidth] = useAtom(widthAtom);
  const [height, setHeight] = useAtom(heightAtom);
  const [undoList, setUndoList] = useAtom(undoListAtom);
  const [toolType, setToolType] = useAtom(toolTypeAtom);
	const [animate, setAnimate] = useAtom(animateAtom);
	
	useEffect(() => {
    const ctx = ref.current.getContext('2d');
		ctx.fillStyle="#ffffff";	
		ctx.fillRect(0, 0, ref.width, ref.height);
		
		if (undo == true) {
		  clearCanvas();
			// Draw items in undo list to the canvas
			undoList.forEach(item => {
				drawItem(item);
			});
		  // Force a re-render 
		  setFillColor(fillColor);
			setUndo(false);
		}
		else if (redo == true) {
			// The item to be redrawn has already been moved to the undo_list from the redo_list
			let undoItem = undoList.slice(-1)[0];
			drawItem(undoItem);
			setRedo(false);
		}
		else if (clear == true) {
      setItems([]);
      setUndoList([]);
      setRedoList([]);
		  clearCanvas();
		  // Force a re-render 
		  setFillColor(fillColor);
			setClear(false);
  	}
		else {
			if (items.length > 0) {
        let tempArray = items.slice();
        clearItemsList();
			  tempArray.forEach(item => {
					drawItem(item);
			  });
			}
		}
	}, [undo, redo, clear]);
  
	const clearAll = () => {
    setItems([]);
    setUndoList([]);
    setRedoList([]);
    // force a re-render
    setFillColor(fillColor);
  };
 
	const clearItemsList = () => {
    setItems([]);
    // force a re-render
    setFillColor(fillColor);
  }

	const drawItem = (item) => {
		// This is used to redraw each item except the last one done for an 'undo'
		if (item.tool === 'pencil' || item.tool === 'eraser') {
      let time = 0;
      let i = 0;
      const j = item.points.length;
      for (i, j; i < j; i++) {
        if (!item.points[i - 1]) continue;
        if (animate) {
          setTimeout(drawStroke.bind(null, item, item.points[i - 1], item.points[i]), time);
          time += 10;
        } else {
          drawLine(item, item.points[i - 1], item.points[i]);
        }
      }
		} else if (item.tool === 'line') {
        drawLine(item, item.end.x, item.end.y);
		} else if (item.tool === 'rectangle') {
        drawRectangle(item, item.end.x, item.end.y);
		} else if (item.tool === 'ellipse') {
        drawEllipse(item, item.end.x, item.end.y);
		} else if (item.tool === 'text') {
	 	  let ctx = ref.current.getContext('2d');
	 	  const { chars, color, startx, starty, fontSize, fontFamily } = item; 
      const font = fontSize + "px " + fontFamily + ", serif";
			ctx.font = font;
			ctx.textAlign = "start";
			const lineHeight = fontSize * 1.2;
			setTextboxVisibility("visible");
	 	  ctx.fillStyle = color;
			const x = startx;
			const y = starty;
			wrapText(ctx, chars, x, y, width, lineHeight);
    } else {
			  throw new Error('unknown tool in drawItem');
		}
	};

	const getWidth = (canvas) => {
    var style = window.getComputedStyle(canvas);
		var compWidth = style.getPropertyValue('width');
  };

  const clearCanvas = ()  => {
    const ctx = ref.current.getContext('2d');
    // First clear the canvas before drawing items 
	  //   from the Items array to it.
	  // Store the current transformation matrix
    ctx.save();
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    // Restore the transform
    ctx.restore();
		// Force a re-render 
		setFillColor(fillColor);
	};
  
	const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    var words = text.split(' ');
    var line = '';
    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width + x;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  const onPointerDown = (e) => {
    const ctx = ref.current.getContext('2d');
    const [x, y] = getCursorPosition(e);
		if (toolType === 'pencil') {
			stroke = {
        id: v4(),
        tool: 'pencil',
        size,
        color,
        points: [{ x, y }]
			};
    } else if (toolType === 'line') {
			line = {
        id: v4(),
        tool: 'line',
        size,
        color,
        start: { x, y },
        end: null
			};
      imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
		} else if (toolType === 'rectangle') {
			rectangle = {
        id: v4(),
        tool: 'rectangle',
        size,
        color,
        fill,
        fillColor,
        start: { x, y },
        end: null
			};
      imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
		} else if (toolType === 'ellipse') {
			ellipse = {
          id: v4(),
          tool: 'ellipse',
          size,
          color,
          fill,
          fillColor,
          start: { x, y },
          end: null
			};
        imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    } else if (toolType === 'eraser') {
			  stroke = {
          id: v4(),
          tool: 'eraser',
          size,
          color: '#ffffff',
          points: [{ x, y }]
				}
        imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
		} else if (toolType === 'text') {
			  textChars = {
          id: v4(),
          tool: 'text',
          startx: x,
          starty: y,
          size,
          color,
          fill,
          fillColor,
          chars,
          fontFamily,
          fontSize,
          textboxVisibility
        };
        imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        setTextboxVisibility("visible");
        ctx.fillStyle = color;
        var font = fontSize + "px " + fontFamily + ", serif";
        ctx.font = font;
        ctx.textAlign = "start";
        var lineHeight = fontSize * 1.2;
        wrapText(ctx, chars, x, y, width, lineHeight);
        const item = textChars;
        imageData = null;
        textChars = null;
				let listItems = undoList;
				listItems.push(item);
				setUndoList(listItems);
    } else {
			  throw new Error('unknown tool in onPointerDown');
		}
	};
  
  const drawStroke = (item, start, { x, y }) => {
    const ctx = ref.current.getContext('2d');
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.lineWidth = item.size;
    ctx.strokeStyle = item.color;
    ctx.globalCompositeOperation = 'source-over';
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

    // drawLine is the same for pencil, line, and eraser
	const drawLine = (item, x, y) => {
    const ctx = ref.current.getContext('2d');
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.lineWidth = item.size;
    ctx.strokeStyle = item.color;
    ctx.globalCompositeOperation = 'source-over';
    ctx.moveTo(item.start.x, item.start.y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  const drawRectangle = (item, pointerX, pointerY) => {
    const startX = pointerX < item.start.x ? pointerX : item.start.x;
    const startY = pointerY < item.start.y ? pointerY : item.start.y;
    const widthX = Math.abs(item.start.x - pointerX);
    const widthY = Math.abs(item.start.y - pointerY);
    const ctx = ref.current.getContext('2d');

    ctx.beginPath();
    ctx.lineWidth = item.size;
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.fillColor;
    ctx.rect(startX, startY, widthX, widthY);
    ctx.stroke();
    if (item.fill) ctx.fill();
  };

	const drawEllipseFill = (centerX, centerY, radiusX, radiusY) => {
    const ctx = ref.current.getContext('2d');
    let xPos;
    let yPos;
    let i = 0;
    for (i; i < 2 * Math.PI; i += 0.01) {
      xPos = centerX - (radiusY * Math.sin(i)) * Math.sin(0) + (radiusX * Math.cos(i)) * Math.cos(0);
      yPos = centerY + (radiusX * Math.cos(i)) * Math.sin(0) + (radiusY * Math.sin(i)) * Math.cos(0);
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
  };

  const drawEllipse = (item, pointerX, pointerY) => {
    const startX = pointerX < item.start.x ? pointerX : item.start.x;
    const startY = pointerY < item.start.y ? pointerY : item.start.y;
    const endX = pointerX >= item.start.x ? pointerX : item.start.x;
    const endY = pointerY >= item.start.y ? pointerY : item.start.y;
    const radiusX = (endX - startX) * 0.5;
    const radiusY = (endY - startY) * 0.5;
    const centerX = startX + radiusX;
    const centerY = startY + radiusY;
    const ctx = ref.current.getContext('2d');

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = item.size;
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.fillColor;

    if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    } else {
      drawEllipseFill(centerX, centerY, radiusX, radiusY);
    }
    ctx.stroke();
    if (item.fill) ctx.fill();
    ctx.closePath();
    ctx.restore();
  };

	const onPointerMove = (e) => {
    const ctx = ref.current.getContext('2d');
    const [x, y] = getCursorPosition(e);
    if (toolType === 'pencil') {
        if (!stroke || stroke.length == 0) {
					 return([]); 
				} else {
            const newPoint = { x, y };
            const start = stroke.points.slice(-1)[0];
            drawStroke(stroke, start, newPoint);
            stroke.points.push(newPoint);
				}
	   } else if (toolType === 'line') {
         if (!line) return;
         ctx.putImageData(imageData, 0, 0);
         drawLine(line, x, y);
	   } else if (toolType === 'rectangle') {
         if (!rectangle) return;
         ctx.putImageData(imageData, 0, 0);
         ctx.save();
         drawRectangle(rectangle, x, y);
         ctx.restore();
	   } else if (toolType === 'ellipse') {
         if (!ellipse) return;
         ctx.putImageData(imageData, 0, 0);
         drawEllipse(ellipse, x, y);
	   } else if (toolType === 'eraser') {
          if (!stroke || stroke.length == 0) {
	    			return([]); 
	    		} else {
                const newPoint = { x, y };
                const start = stroke.points.slice(-1)[0];
                drawStroke(stroke, start, newPoint);
                stroke.points.push(newPoint);
	    			}
	   } else if (toolType === 'text') {
			   return;
     } else {
			   throw new Error('unknown tool in onPointerMove');
		 }
  };
  
  const onPointerUp = (e) => {
    const [x, y] = getCursorPosition(e);
    if (toolType === 'pencil') {
      if (!stroke || stroke.length == 0) {
				stroke = [];
			} else {
          onPointerMove(x, y); 
          const item = stroke;
          stroke = null;
				  let listItems = undoList;
				  listItems.push(item);
				  setUndoList(listItems);
			} 
		} else if (toolType === 'line') {
	      if (!line) {
				  return;
				} else {
            const item1 = line;
            imageData = null;
            line = null;
            item1.end = { x, y };
				    let listItems = undoList;
				    listItems.push(item1);
				    setUndoList(listItems);
				}
		} else if (toolType === 'rectangle') {
        if (!rectangle) {
					return;
				} else {
            const item = rectangle;
            imageData = null;
            rectangle = null;
            item.end = { x, y };
				    let listItems = undoList;
				    listItems.push(item);
				    setUndoList(listItems);
				}
		} else if (toolType === 'ellipse') {
        if (!ellipse) {
					return;
				} else {
            const item = ellipse;
            imageData = null;
            ellipse = null;
            item.end = { x, y };
				    let listItems = undoList;
				    listItems.push(item);
				    setUndoList(listItems);
				}
		} else if (toolType === 'eraser') {
        if (!stroke || stroke.length == 0) {
				  stroke = [];
				} else {
					  onPointerMove(x, y);
            const item = stroke;
            stroke = null;
				    let listItems = undoList;
				    listItems.push(item);
				    setUndoList(listItems);
				}
		} else if (toolType === 'text') {
        return;
    } else {
		    throw new Error('unknown tool in onPointerUp. tooltype: ', toolType);
		}
  };
  
  const getCursorPosition = (e) => {
    const {top, left} = ref.current.getBoundingClientRect();
    return [
      e.clientX - left,
      e.clientY - top
    ];
  };
  
	  const canvasClassName = 'canvas';
    const canvasAspectRatio = .75;
    return (
	   <canvas className = "canvas" 
			  ref={ref} 
			  width={width}
			  height={height}
        className={canvasClassName}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerUp}
        onPointerUp={onPointerUp}
      />
    )
  // }
});
 
export default Whiteboard;

Whiteboard.propTypes = {
	resetClear: PropTypes.func,
	resetUndo: PropTypes.func,
	resetRedo: PropTypes.func,
  onCompleteItem: PropTypes.func, // function(stroke:Stroke) { ... }
  doUndo: PropTypes.func,
  doRedo: PropTypes.func,
};

Whiteboard.defaultProps = {
  tool: 'text',
};

