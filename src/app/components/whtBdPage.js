import React, { useState, useEffect, createRef, useRef } from "react";
import { atom, useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import Whiteboard from "./Whiteboard.js";
import "./styles/whtBdPage.scss";
import Line1Pixel from "../img/1pix.png";
import Line3Pixel from "../img/3pix.png";
import Line5Pixel from "../img/5pix.png";
import Line10Pixel from "../img/10pix.png";
import Line15Pixel from "../img/15pix.png";
import Line20Pixel from "../img/20pix.png";
import eraserImg from "../img/eraser.png";
import pencilImg from "../img/pencil.png";
import ellipseImg from "../img/ellipse.png";
import rectangleImg from "../img/rectangle.png";
import PropTypes from "prop-types";
import io from "socket.io-client";
import config from "../../../server/config.js";

export const sizeAtom = atom(3);
export const colorAtom = atom("#2120AC");
export const fillAtom = atom(false);
export const fillColorAtom = atom("#2120AC");
export const charsAtom = atom("");
export const fontFamilyAtom = atom("Quicksand");
export const fontSizeAtom = atom(18);
export const textboxVisibilityAtom = atom("visible");
export const clearAtom = atom(false);
export const undoAtom = atom(false);
export const redoAtom = atom(false);
export const itemsAtom = atom([]);
export const undoListAtom = atom([]);
export const redoListAtom = atom([]);
export const widthAtom = atom(600);
export const heightAtom = atom(450);
export const toolTypeAtom = atom("pencil");

function WhtBdPage(props) {
  const [size, setSize] = useAtom(sizeAtom);
  const [color, setColor] = useAtom(colorAtom);
  const [fill, setFill] = useAtom(fillAtom);
  const [fillColor, setFillColor] = useAtom(fillColorAtom);
  const [chars, setChars] = useAtom(charsAtom);
  const [fontFamily, setFontFamily] = useAtom(fontFamilyAtom);
  const [fontSize, setFontSize] = useAtom(fontSizeAtom);
  const [textboxVisibility, setTextboxVisibility] = useAtom(
    textboxVisibilityAtom
  );
  const [clear, setClear] = useAtom(clearAtom);
  const [undo, setUndo] = useAtom(undoAtom);
  const [redo, setRedo] = useAtom(redoAtom);
  const [items, setItems] = useAtom(itemsAtom);
  const [redoList, setRedoList] = useAtom(redoListAtom);
  const [width, setWidth] = useAtom(widthAtom);
  const [height, setHeight] = useAtom(heightAtom);
  const [undoList, setUndoList] = useAtom(undoListAtom);
  const [toolType, setToolType] = useAtom(toolTypeAtom);

  const socket = io(config.socketAddr);
  const navigate = useNavigate();
  
	useEffect(() => {
    socket.on("undo", doUndo);
    socket.on("addItem", (item) => {
      setItems(items.concat([item]));
      let tempList = undoList;
      setUndoList(tempList.push([item]));
    });
    socket.on("clear", doClear);
    socket.on("redo", doRedo);
    handleResize();
    window.addEventListener("resize", handleResize);
    setHeight(width * 0.75);

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("addItem");
      socket.off("undo");
      socket.off("redo");
      socket.off("clear");
    };
  }, [undo, redo, clear]);

  const doUndo = () => {
    if (undoList.length == 0) return;
    let tempList2 = undoList.slice();
    let undoneItem = tempList2.pop();
    setUndoList(tempList2);
    let tempList3 = redoList.slice();
    tempList3.push(undoneItem);
    setRedoList(tempList3);
    setItems([]);
    setUndo(true);
  };

  const doClear = () => {
    setClear(true);
  };

  const doRedo = () => {
    if (redoList.length == 0) return;
    let tempList4 = redoList.slice();
    let redoneItem = tempList4.pop();
    let tempList5 = undoList.slice();
    tempList5.push(redoneItem);
    setRedoList(tempList4);
    setUndoList(tempList5);
    setItems([]);
    setRedo(true);
  };

  const addToUndoList = (data) => {
    let tempList6 = undoList.slice();
    tempList6.push(data);
    setUndoList(tempList6);
  };

  const handleResize = () => {
    if (window.innerWidth < 340) {
      setWidth(200);
      setHeight(150);
    } else {
      if (window.innerWidth < 480) {
        setWidth(320);
        setHeight(240);
      } else {
        if (window.innerWidth < 620) {
          setWidth(460);
          setHeight(345);
        } else {
          setWidth(600);
          setHeight(450);
        }
      }
    }
  };

  const updateDimensions = () => {
    if (window.innerWidth < 500) {
      setWidth(450);
      setHeight(102);
    } else {
      let update_width = window.innerWidth - 100;
      let update_height = Math.round(update_width / 4.4);
      setWidth(update_width);
      setHeight(update_height);
    }
  };
  
	const ref = useRef(null);
  const clearChars = () => {
    setChars("");
	}
  
  return (
    <div className = "page">
    <a href="#" className="returnLink"
      onClick={() => {navigate(-1)}}
    >
      &nbsp;return to previous page&nbsp;
    </a>
      <h2>Whiteboard</h2>
      <div id="whiteboarddiv" className="whiteboardDiv">
        <Whiteboard
          ref={ref}
          id={"canvasdiv"}
          resetClear={() => setClear(false)}
          resetUndo={() => setUndo(false)}
          resetRedo={() => setRedo(false)}
          onCompleteItem={(i) => socket.emit("addItem", i)}
        />

        <div className="undoRedoClearRow">
          <button className="undoRedoClearButton"
            onClick={() => {
              socket.emit("undo"), doUndo();
            }}
          >
            Undo
          </button>
          <button className="undoRedoClearButton"
            onClick={() => {
              socket.emit("redo"), doRedo();
            }}
          >
            Redo
          </button>
          <button className="undoRedoClearButton"
            onClick={() => {
              socket.emit("clear"), setClear(true);
            }}
          >
            Clear
          </button>
        </div>  {/* undoRedoClearRow */}
      </div>   {/* whiteboarddiv */}

      <div className="toolsDiv">
        <h3>Drawing and Text Tools</h3>
        <div className="alignedBar">
          <button className="buttonPencil"
            onClick={() => {
              setToolType("pencil");
              setClear(false);
            }}
          >
          </button>

          <button className="buttonLine"
            onClick={() => {
              setToolType("line");
              setClear(false);
            }}
          >
          </button>

          <button className="buttonEllipse"
            onClick={() => {
              setToolType("ellipse");
              setClear(false);
            }}
          >
          </button>

          <button className="buttonRectangle"
            onClick={() => {
              setToolType("rectangle");
              setClear(false);
            }}
          >
          </button>

          <button className="buttonEraser"
            onClick={() => {
              setToolType("eraser");
              setClear(false);
            }}
          >
          </button>
	      <button className="undoRedoClearButton"
          onClick={() => setToolType("text")}
        >
          Text
        </button>

        </div>  {/* alignedBar */}
        <h3>Tool line thickness </h3>
        <div className="alignedBar">
          <button className="button1px"
            onClick={() => setSize(1)}
          >
          </button>
          <button className="button3px"
            onClick={() => setSize(3)}
          >
          </button>
          <button className="button5px"
            onClick={() => setSize(5)}
          >
          </button>
          <button className="button10px"
            onClick={() => setSize(10)}
          >
          </button>
          <button className="button15px"
            onClick={() => setSize(15)}
          >
          </button>
          <button className="button20px"
            onClick={() => setSize(20)}
          >
          </button>
          <br />
        </div>  {/* alignedBar */}
        <div className="rangeBar">
          <input
            min="1"
            max="20"
            type="range"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          />
          <div className="rangeWindow">&#8199;{size}</div>
        </div>  {/* rangeBar */}
       
	      <div className = "colorBar">
            <h3 htmlFor="color">Color:  </h3>
            <input type="color" className="colorInput"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setFillColor(e.target.value);
              }}
            />
          
            {toolType == "ellipse" || toolType == "rectangle" ? (
              <div className="flexRow">
                <h3>Fill in the shape with color?</h3>
                <input
                  type="checkbox"
                  value={fill}
							    checked={fill}
                  onChange={(e) => setFill(e.target.checked)}
                />
                {fill ? (
									  <div className="noWrap">
                    <h3 htmlFor="">&#8199;Fill-in color: </h3>
                    <input type="color" className="colorInput"
                      value={fillColor}
                      onChange={(e) => setFillColor(e.target.value)}
                    />
									  </div>
                ) : (
                  ""
                )}<br /><br />
              </div>

          ) : (
            ""
          )}
        {/* colorBar */}
        </div>  

	      <div className = "textSection">
          <span className="span1"> <i> <b>To enter Text</b>, choose Text above, choose a font size, enter text in the textbox below, then click on the whiteboard above to place it.
          </i> </span>

        <h3>Text font size </h3>
        <div className="alignedBar">
          <button className="button8"
            onClick={() => setFontSize(8)}
          >
            8
          </button>
          <button className="button12"
            onClick={() => setFontSize(12)}
          >
            12
          </button>
          <button className="button18"
            onClick={() => setFontSize(18)}
          >
            18
          </button>
          <button className="button24"
            onClick={() => setFontSize(24)}
          >
            24
          </button>
          <button className="button30"
            onClick={() => setFontSize(30)}
          >
            30
          </button>
          <button className="button36"
            onClick={() => setFontSize(36)}
          >
            36
          </button>
          <br />
        </div>  {/* alignedBar */}
        <div className="rangeBar">
          <input
            min="8"
            max="36"
            type="range"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <div className="rangeWindow">&#8199;{fontSize}</div>
        </div>
          <textarea 
            className="textEntryBox"
            type="text"
            id="textbox"
            name="textbox"
            value={chars}
            rows="5"
            cols="40"
            onChange={(e) => setChars(e.target.value)}
          />
        </div>  {/* textboxArea */}
        <button className="undoRedoClearButton"
          onClick={clearChars}
        >
          Clear Text
        </button>
	      <br />
        

      {/* toolsDiv*/}
      </div>      
	{/* page */}
	</div> 
  );
}

export default WhtBdPage;
