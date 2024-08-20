import React, { useEffect, useRef } from "react";
import * as mke from "./MathKeyboardEngine/MathKeyboardEngine.es2020-esm";

const MathInput = () => {
  const matrixWidthRef = useRef(null);
  const matrixHeightRef = useRef(null);

  const simulateKeyPress = (key, code, keyCode) => {
    const event = new KeyboardEvent("keydown", {
      key: key,
      code: code,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  };

  useEffect(() => {
    let latexConfiguration = new mke.LatexConfiguration();
    let keyboardMemory = new mke.KeyboardMemory();
    const supportsSelectionMode = "supportsSelectionMode";
    const darkSelectionModeColor = "#1668c7";
    const lightSelectionModeColor = "#add8e6";

    function myLeaveSelectionMode(keyboardMemory) {
      mke.leaveSelectionMode(keyboardMemory);
      let elements = document.getElementsByClassName(supportsSelectionMode);
      for (let element of elements) {
        element.classList.remove("inSelectionMode");
      }
    }

    function myEnterSelectionMode(keyboardMemory) {
      mke.enterSelectionMode(keyboardMemory);
      let elements = document.getElementsByClassName(supportsSelectionMode);
      for (let element of elements) {
        element.classList.add("inSelectionMode");
      }
    }

    function setSelectionModeColor(color) {
      document.body.style.setProperty("--selection-mode-color", color);
      latexConfiguration.selectionHightlightStart =
        String.raw`\bbox[` + color + "]{";
    }

    latexConfiguration.selectionHightlightEnd = "}";

    const bodyClassList = document.body.classList;
    const colorScheme = document.getElementById("colorScheme");

    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      bodyClassList.remove("dark");
      if (colorScheme) {
        colorScheme.innerText = "light";
      }
      setSelectionModeColor(lightSelectionModeColor);
    } else {
      bodyClassList.add("dark");
      if (colorScheme) {
        colorScheme.innerText = "dark";
      }
      setSelectionModeColor(darkSelectionModeColor);
    }

    const colorSchemeToggle = document.getElementById("colorSchemeToggle");
    if (colorSchemeToggle) {
      colorSchemeToggle.onclick = () => {
        if (colorScheme.innerText === "light") {
          bodyClassList.add("dark");
          colorScheme.innerText = "dark";
          setSelectionModeColor(darkSelectionModeColor);
        } else {
          bodyClassList.remove("dark");
          colorScheme.innerText = "light";
          setSelectionModeColor(lightSelectionModeColor);
        }
        displayResult();
      };
    }

    const multiplicationSignToggle = document.getElementById(
      "multiplicationSignToggle"
    );
    if (multiplicationSignToggle) {
      multiplicationSignToggle.onclick = () => {
        const element = document.getElementById("multiplicationSignType");
        if (element) {
          element.innerText = element.innerText === "cross" ? "dot" : "cross";
          displayResult();
        }
      };
    }

    const decimalSeparatorToggle = document.getElementById(
      "decimalSeparatorToggle"
    );
    if (decimalSeparatorToggle) {
      decimalSeparatorToggle.onclick = () => {
        const element = document.getElementById("decimalSeparatorType");
        const key = document.getElementById("decimalSeparator");
        if (element && key) {
          if (element.innerText === "decimal comma") {
            element.innerText = "decimal point";
            typesetLatexInKey(".", key);
          } else {
            element.innerText = "decimal comma";
            typesetLatexInKey("{,}", key);
          }
          displayResult();
        }
      };
    }

    function reRegisterMatrix() {
      const matrixWidth = matrixWidthRef.current?.value;
      const matrixHeight = matrixHeightRef.current?.value;

      registerNodeKey(
        "pmatrix",
        () => new mke.MatrixNode("pmatrix", matrixWidth, matrixHeight)
      );
      registerNodeKey(
        "vmatrix",
        () => new mke.MatrixNode("vmatrix", matrixWidth, matrixHeight)
      );
    }

    const getDecimalSeparatorPreference = () => {
      const element = document.getElementById("decimalSeparatorType");
      return element?.innerText === "decimal comma" ? "{,}" : ".";
    };

    const getDecimalSeparatorNode = () =>
      new mke.DecimalSeparatorNode(getDecimalSeparatorPreference);

    for (let i = 0; i < 10; i++) {
      registerNodeKey("digit" + i, () => new mke.DigitNode(i.toString()));
    }

    for (let letter of ["a", "b", "c", "x", "y", "z"]) {
      registerNodeKey(letter, () => new mke.StandardLeafNode(letter));
    }

    for (let s of [
      "alpha",
      "beta",
      "gamma",
      "lambda",
      "mu",
      "pi",
      "div",
      "sin",
      "tan",
      "cos",
      "arcsin",
      "arccos",
      "arctan",
      "infty",
      "leftarrow",
      "rightarrow",
      "uparrow",
      "downarrow",
      "approx",
    ]) {
      registerNodeKey(s, () => new mke.StandardLeafNode("\\" + s));
    }

    registerNodeKey("decimalSeparator", getDecimalSeparatorNode);

    reRegisterMatrix();

    matrixWidthRef.current?.addEventListener("change", reRegisterMatrix);
    matrixHeightRef.current?.addEventListener("change", reRegisterMatrix);

    registerNodeKey("equal", () => new mke.StandardLeafNode("="));
    registerNodeKey(
      "notEqual",
      () => new mke.StandardLeafNode(String.raw`\neq`)
    );
    registerNodeKey(
      "NotIn",
      () => new mke.StandardLeafNode(String.raw`\notin`)
    );
    registerNodeKey("lessThan", () => new mke.StandardLeafNode("<"));
    registerNodeKey("greaterThan", () => new mke.StandardLeafNode(">"));
    registerNodeKey(
      "lessThanOrEqual",
      () => new mke.StandardLeafNode(String.raw`\leq`)
    );
    registerNodeKey(
      "greaterThanOrEqual",
      () => new mke.StandardLeafNode(String.raw`\geq`)
    );
    registerNodeKey(
      "plusminus",
      () => new mke.StandardLeafNode(String.raw`\pm`)
    );
    registerNodeKey("degree", () => new mke.StandardLeafNode("°"));
    registerNodeKey("dx", () => new mke.StandardLeafNode("dx"));
    registerNodeKey(
      "paralel",
      () => new mke.StandardLeafNode(String.raw`\parallel`)
    );
    registerNodeKey(
      "delta",
      () => new mke.StandardLeafNode(String.raw`\Delta`)
    );
    registerNodeKey(
      "perpendicular",
      () => new mke.StandardLeafNode(String.raw`\perp`)
    );
    registerNodeKey(
      "angle",
      () => new mke.StandardLeafNode(String.raw`\angle`)
    );

    const getMultiplicationNode = () =>
      new mke.StandardLeafNode(() =>
        document.getElementById("multiplicationSignType")?.innerText === "cross"
          ? String.raw`\times`
          : String.raw`\cdot`
      );
    registerNodeKey("plus", () => new mke.StandardLeafNode("+"));
    registerNodeKey("minus", () => new mke.StandardLeafNode("-"));
    registerNodeKey("multiply", getMultiplicationNode);
    registerNodeKey("ratio", () => new mke.StandardLeafNode(":"));
    registerNodeKey("faculty", () => new mke.StandardLeafNode("!"));

    const getFractionNode = () =>
      new mke.DescendingBranchingNode(String.raw`\frac{`, "}{", "}");
    registerNodeKey(
      "fraction",
      getFractionNode,
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    const getBinomialNode = () =>
      new mke.DescendingBranchingNode(String.raw`\binom{`, "}{", "}");
    registerNodeKey(
      "binomial",
      getBinomialNode,
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    const getPowerNode = () => new mke.AscendingBranchingNode("", "^{", "}");
    registerNodeKey(
      "power",
      getPowerNode,
      mke.insertWithEncapsulateCurrent,
      mke.insertWithEncapsulateSelectionAndPrevious
    );
    const getSubscriptNode = () =>
      new mke.DescendingBranchingNode("", "_{", "}");
    registerNodeKey(
      "subscript",
      getSubscriptNode,
      mke.insertWithEncapsulateCurrent,
      mke.insertWithEncapsulateSelectionAndPrevious
    );
    const getSquareRootNode = () =>
      new mke.StandardBranchingNode(String.raw`\sqrt{`, "}");
    registerNodeKey(
      "squareRoot",
      getSquareRootNode,
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    registerNodeKey(
      "nthRoot",
      () => new mke.DescendingBranchingNode(String.raw`\sqrt[`, "]{", "}")
    );
    registerNodeKey(
      "3thRoot",
      () => new mke.DescendingBranchingNode(String.raw`\sqrt[3]{`, "}")
    );
    registerNodeKey(
      "log(x)",
      () => new mke.StandardLeafNode(String.raw`\log(x)`)
    );
    registerNodeKey(
      "ln(x)",
      () => new mke.StandardLeafNode(String.raw`\ln(x)`)
    );
    registerNodeKey(
      "log()",
      () => new mke.DescendingBranchingNode(String.raw`\log({`, "})")
    );
    registerNodeKey(
      "d/dx",
      () => new mke.StandardLeafNode(String.raw`\frac{d}{dx}`)
    );
    registerNodeKey(
      "ln()",
      () => new mke.DescendingBranchingNode(String.raw`\ln({`, "})")
    );
    registerNodeKey("e", () => new mke.StandardLeafNode("e"));
    registerNodeKey(
      "roundBrackets",
      () => new mke.RoundBracketsNode(),
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    const getSquareBracketsNode = () =>
      new mke.StandardBranchingNode(String.raw`\left[`, String.raw`\right]`);
    registerNodeKey(
      "squareBrackets",
      getSquareBracketsNode,
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    const getPipesNode = () =>
      new mke.StandardBranchingNode(String.raw`\left|`, String.raw`\right|`);
    registerNodeKey(
      "pipes",
      getPipesNode,
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    registerNodeKey(
      "doublePipes",
      () =>
        new mke.StandardBranchingNode(
          String.raw`\left\|`,
          String.raw`\right\|`
        ),
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    const getCurlyBracketsNode = () =>
      new mke.StandardBranchingNode(String.raw`\left\{`, String.raw`\right\}`);
    registerNodeKey(
      "curlyBrackets",
      getCurlyBracketsNode,
      mke.insert,
      mke.insertWithEncapsulateSelection
    );
    registerNodeKey(
      "naturalNumbers",
      () => new mke.StandardLeafNode(String.raw`\mathbb{N}`)
    );
    registerNodeKey(
      "integers",
      () => new mke.StandardLeafNode(String.raw`\mathbb{Z}`)
    );
    registerNodeKey(
      "realNumbers",
      () => new mke.StandardLeafNode(String.raw`\mathbb{R}`)
    );
    registerNodeKey(
      "isMemberOf",
      () => new mke.StandardLeafNode(String.raw`\in`)
    );
    registerNodeKey(
      "isProperSubsetOf",
      () => new mke.StandardLeafNode(String.raw`\subset`)
    );
    registerNodeKey(
      "isSubsetOf",
      () => new mke.StandardLeafNode(String.raw`\subseteq`)
    );
    registerNodeKey(
      "setDifference",
      () => new mke.StandardLeafNode(String.raw`\setminus`)
    );
    registerNodeKey(
      "exists",
      () => new mke.StandardLeafNode(String.raw`\exists`)
    );
    registerNodeKey(
      "forAll",
      () => new mke.StandardLeafNode(String.raw`\forall`)
    );
    registerNodeKey("not", () => new mke.StandardLeafNode(String.raw`\neg`));
    registerNodeKey("or", () => new mke.StandardLeafNode(String.raw`\lor`));
    registerNodeKey("and", () => new mke.StandardLeafNode(String.raw`\land`));
    registerNodeKey(
      "doubleRightArrow",
      () => new mke.StandardLeafNode(String.raw`\Rightarrow`)
    );
    registerNodeKey(
      "doubleLeftArrow",
      () => new mke.StandardLeafNode(String.raw`\Leftarrow`)
    );
    registerNodeKey(
      "cos-1",
      () => new mke.StandardLeafNode(String.raw`\cos^{-1}`)
    );
    registerNodeKey(
      "taninv",
      () => new mke.StandardLeafNode(String.raw`\tan^{inv}`)
    );
    registerNodeKey("f(x)", () => new mke.StandardLeafNode("f(x)"));
    const getIntegralNode = () =>
      new mke.AscendingBranchingNode(String.raw`\int_{`, "}^{", "}");
    registerNodeKey("integral", getIntegralNode);
    const getSumNode = () =>
      new mke.AscendingBranchingNode(String.raw`\sum_{`, "}^{", "}");
    registerNodeKey("sum", getSumNode);
    const getProductNode = () =>
      new mke.AscendingBranchingNode(String.raw`\prod_{`, "}^{", "}");
    registerNodeKey("product", getProductNode);
    const getLimitNode = () =>
      new mke.StandardBranchingNode(String.raw`\lim_{`, "}");
    registerNodeKey("limit", getLimitNode);

    function registerNodeKey(
      elementId,
      nodeGetter,
      onclickFuncForKeyboardMemoryAndNode = mke.insert,
      onclickSelectionModeArrowFuncForKeyboardMemoryAndNode = null
    ) {
      let element = document.getElementById(elementId);
      if (element) {
        if (onclickSelectionModeArrowFuncForKeyboardMemoryAndNode != null) {
          element.classList.add(supportsSelectionMode);
        }

        let latex = mke.getViewModeLatex(nodeGetter(), latexConfiguration);
        typesetLatexInKey(latex, element);
        element.onclick = () => {
          if (mke.inSelectionMode(keyboardMemory)) {
            if (onclickSelectionModeArrowFuncForKeyboardMemoryAndNode != null) {
              onclickSelectionModeArrowFuncForKeyboardMemoryAndNode(
                keyboardMemory,
                nodeGetter()
              );
            } else {
              onclickFuncForKeyboardMemoryAndNode(keyboardMemory, nodeGetter());
            }
            myLeaveSelectionMode(keyboardMemory);
          } else {
            onclickFuncForKeyboardMemoryAndNode(keyboardMemory, nodeGetter());
          }
          displayResult();
        };
      }
    }

    function typesetLatexInKey(latex, element) {
      if (element) {
        element.innerText = String.raw`\(` + latex + String.raw`\)`;
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element]);
      }
    }

    function displayResult() {
      if (
        keyboardMemory.current instanceof mke.Placeholder &&
        keyboardMemory.current.nodes.length === 0
      ) {
        latexConfiguration.activePlaceholderShape = String.raw`\blacksquare`;
      } else {
        latexConfiguration.activePlaceholderShape = "|";
      }

      let editModeLatex = mke.getEditModeLatex(
        keyboardMemory,
        latexConfiguration
      );
      typesetLatexInOutputBox(
        editModeLatex,
        document.getElementById("typesetEditModeLatex")
      );

      let viewModeLatex = mke.getViewModeLatex(
        keyboardMemory,
        latexConfiguration
      );
      const viewModeLatexElement = document.getElementById("viewModeLatex");
      if (viewModeLatexElement) {
        viewModeLatexElement.innerText = viewModeLatex;
      }
    }

    function typesetLatexInOutputBox(latex, element) {
      if (element) {
        element.innerText =
          String.raw`\(\displaystyle ` + latex + String.raw`\)`;
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element]);
      }
    }

    // Handle key presses of a physical keyboard
    let inShift = false;
    document.onkeyup = (e) => {
      const key = e.code;
      if (key.startsWith("Shift")) {
        inShift = false;
      }
    };

    function createHandler(
      matchingPredicateForKey,
      handleForKeyboardMemoryAndKey
    ) {
      return {
        canHandle: matchingPredicateForKey,
        handle: handleForKeyboardMemoryAndKey,
      };
    }

    const physicalKeydownHandlersForShift = [
      createHandler(
        (key) => key === "Digit6",
        (k, key) => mke.insertWithEncapsulateCurrent(k, getPowerNode())
      ),
      createHandler(
        (key) => key === "Digit9",
        (k, key) => mke.insert(k, new mke.RoundBracketsNode())
      ),
      createHandler(
        (key) => key === "Digit0",
        (k, key) => mke.moveRight(k)
      ),
      createHandler(
        (key) => key === "Digit8",
        (k, key) => mke.insert(k, getMultiplicationNode())
      ),
      createHandler(
        (key) => key === "Equal",
        (k, key) => mke.insert(k, new mke.StandardLeafNode("+"))
      ),
      createHandler(
        (key) => key === "Minus",
        (k, key) => mke.insertWithEncapsulateCurrent(k, getSubscriptNode())
      ),
      createHandler(
        (key) => key === "Digit1",
        (k, key) => mke.insert(k, new mke.StandardLeafNode("!"))
      ),
      createHandler(
        (key) => key === "Digit5",
        (k, key) => mke.insert(k, new mke.StandardLeafNode(String.raw`\%`))
      ),
      createHandler(
        (key) => key.startsWith("Key"),
        (k, key) => mke.insert(k, new mke.StandardLeafNode(key[3]))
      ),
      createHandler(
        (key) => key === "ArrowLeft",
        (k, key) => {
          myEnterSelectionMode(k);
          mke.selectLeft(k);
        }
      ),
      createHandler(
        (key) => key === "ArrowRight",
        (k, key) => {
          myEnterSelectionMode(k);
          mke.selectRight(k);
        }
      ),
      createHandler(
        (key) => key === "Backslash",
        (k, key) => mke.insert(k, getPipesNode())
      ),
      createHandler(
        (key) => key === "BracketLeft",
        (k, key) => mke.insert(k, getCurlyBracketsNode())
      ),
      createHandler(
        (key) => key === "BracketRight",
        (k, key) => mke.moveRight(k)
      ),
      createHandler(
        (key) => key === "Comma",
        (k, key) => mke.insert(k, new mke.StandardLeafNode("<"))
      ),
      createHandler(
        (key) => key === "Period",
        (k, key) => mke.insert(k, new mke.StandardLeafNode(">"))
      ),
      createHandler(
        (key) => key === "Semicolon",
        (k, key) => mke.insert(k, new mke.StandardLeafNode(":"))
      ),
    ];

    const selectionModePhysicalKeydownHandlersForShift = [
      createHandler(
        (key) => key === "Digit6",
        (k, key) =>
          mke.insertWithEncapsulateSelectionAndPrevious(k, getPowerNode())
      ),
      createHandler(
        (key) => key === "BracketLeft",
        (k, key) =>
          mke.insertWithEncapsulateSelection(k, getCurlyBracketsNode())
      ),
      createHandler(
        (key) => key === "Backslash",
        (k, key) => mke.insertWithEncapsulateSelection(k, getPipesNode())
      ),
      createHandler(
        (key) => key === "Digit9",
        (k, key) =>
          mke.insertWithEncapsulateSelection(k, new mke.RoundBracketsNode())
      ),
    ];

    const selectionModePhysicalKeydownHandlersNoShift = [
      createHandler(
        (key) => key === "Backspace",
        (k, key) => mke.deleteSelection(k)
      ),
      createHandler(
        (key) => key === "Delete",
        (k, key) => mke.deleteSelection(k)
      ),
      createHandler(
        (key) => key === "BracketLeft",
        (k, key) =>
          mke.insertWithEncapsulateSelection(k, getSquareBracketsNode())
      ),
      createHandler(
        (key) => key === "Slash",
        (k, key) => mke.insertWithEncapsulateSelection(k, getFractionNode())
      ),
    ];

    const physicalKeydownHandlersNoShift = [
      createHandler(
        (key) => key.startsWith("Digit"),
        (k, key) => mke.insert(k, new mke.DigitNode(key[5]))
      ),
      createHandler(
        (key) => key.startsWith("Key"),
        (k, key) =>
          mke.insert(k, new mke.StandardLeafNode(key[3].toLocaleLowerCase()))
      ),
      createHandler(
        (key) => key === "Backspace",
        (k, key) => mke.deleteLeft(k)
      ),
      createHandler(
        (key) => key === "ArrowLeft",
        (k, key) => mke.moveLeft(k)
      ),
      createHandler(
        (key) => key === "ArrowRight",
        (k, key) => mke.moveRight(k)
      ),
      createHandler(
        (key) => key === "ArrowUp",
        (k, key) => mke.moveUp(k)
      ),
      createHandler(
        (key) => key === "ArrowDown",
        (k, key) => mke.moveDown(k)
      ),
      createHandler(
        (key) => key === "Slash",
        (k, key) =>
          mke.insertWithEncapsulateCurrent(k, getFractionNode(), {
            deleteOuterRoundBracketsIfAny: true,
          })
      ),
      createHandler(
        (key) => key === "Equal",
        (k, key) => mke.insert(k, new mke.StandardLeafNode("="))
      ),
      createHandler(
        (key) => key === "Minus",
        (k, key) => mke.insert(k, new mke.StandardLeafNode("-"))
      ),
      createHandler(
        (key) => key === "Period" || key === "Comma",
        (k, key) => mke.insert(k, getDecimalSeparatorNode())
      ),
      createHandler(
        (key) => key === "BracketLeft",
        (k, key) => mke.insert(k, getSquareBracketsNode())
      ),
      createHandler(
        (key) => key === "BracketRight",
        (k, key) => mke.moveRight(k)
      ),
      createHandler(
        (key) => key === "Delete",
        (k, key) => mke.deleteRight(k)
      ),
    ];

    document.onkeydown = (e) => {
      if (
        document.activeElement.classList.contains(
          "disable-physical-keypress-math-input-when-focused"
        )
      ) {
        return;
      }
      let shouldPreventDefault = true;
      const key = e.code;
      if (key.startsWith("Shift")) {
        inShift = true;
      } else if (mke.inSelectionMode(keyboardMemory)) {
        if (key === "ArrowLeft") {
          mke.selectLeft(keyboardMemory);
        } else if (key === "ArrowRight") {
          mke.selectRight(keyboardMemory);
        } else if (inShift) {
          let handler = selectionModePhysicalKeydownHandlersForShift.find(
            (handler) => handler.canHandle(key)
          );
          if (handler != null) {
            handler.handle(keyboardMemory, key);
            myLeaveSelectionMode(keyboardMemory);
          } else {
            myLeaveSelectionMode(keyboardMemory, key);
            physicalKeydownHandlersForShift
              .find((handler) => handler.canHandle(key))
              ?.handle(keyboardMemory, key);
          }
        } else {
          let handler = selectionModePhysicalKeydownHandlersNoShift.find(
            (handler) => handler.canHandle(key)
          );
          if (handler != null) {
            handler.handle(keyboardMemory, key);
            myLeaveSelectionMode(keyboardMemory);
          } else {
            myLeaveSelectionMode(keyboardMemory);
            physicalKeydownHandlersNoShift
              .find((handler) => handler.canHandle(key))
              ?.handle(keyboardMemory, key);
          }
        }
      } else {
        if (!inShift && key === "Backslash") {
          inputToParse?.focus();
          shouldPreventDefault = false;
        } else if (inShift) {
          physicalKeydownHandlersForShift
            .find((handler) => handler.canHandle(key))
            ?.handle(keyboardMemory, key);
        } else {
          physicalKeydownHandlersNoShift
            .find((handler) => handler.canHandle(key))
            ?.handle(keyboardMemory, key);
        }
      }
      displayResult();
      if (shouldPreventDefault) {
        e.preventDefault(/* Prevent triggering a browser hot key. */);
      }
    };

    const inputToParse = document.getElementById("inputToParse");
    const inputMirror = document.getElementById("inputMirror");
    if (inputToParse && inputMirror) {
      inputToParse.oninput = inputToParse.onpaste = () => {
        const value = inputToParse.value;
        inputMirror.innerText =
          value.length > 2 ? inputToParse.value + " ----> press Enter" : value;
      };

      const parserConfig = new mke.LatexParserConfiguration();
      parserConfig.preferRoundBracketsNode = true;
      parserConfig.preferredDecimalSeparator = getDecimalSeparatorPreference;
      inputToParse.onkeydown = (e) => {
        if (e.code === "Enter") {
          const nodes = mke.parseLatex(inputToParse.value, parserConfig)
            .syntaxTreeRoot.nodes;
          mke.insert(keyboardMemory, nodes);
          displayResult();
          inputToParse.value = "";
          inputMirror.innerText = "";
          document.activeElement.blur();
          window.scrollTo(0, 0);
        }
      };
    }

    // Initial render
    displayResult();
  }, []);

  return (
    <div
      className="bg-transparent text-white pt-8 pb-8 rounded-md"
      id="Anaaremere"
    >
      <div
        id="typesetEditModeLatex"
        className="mb-4 p-2 bg-transparent border border-airforce-princeton rounded-md"
      ></div>
      <div id="viewModeLatex"></div>
      <div className="flex justify-between">
        <div>
          <div className="text-right col-span-3 pr-10">
            <h1
              className="flex justify-start font-roboto font-bold text-xl pl-4 pr-4 whitespace-nowrap"
              style={{ maxWidth: "100%" }}
            >
              Modify and Insert Matrix
            </h1>
            <div className="flex flex-col items-start">
              <label
                htmlFor="matrixHeight"
                className="mr-2 mt-4 w-full font-kodchasan font-bold text-lg flex justify-start"
              >
                Rows
              </label>
              <input
                id="matrixHeight"
                type="number"
                ref={matrixHeightRef}
                defaultValue="2"
                min="1"
                className="disable-physical-keypress-math-input-when-focused p-2 bg-transparent border border-airforce-princeton rounded-md text-center mb-3 text-blue-mainpagebeforeLogin border-blue-mainpagebeforeLogin"
              />

              <label
                htmlFor="matrixWidth"
                className="mr-2 font-kodchasan font-bold text-lg"
              >
                Columns
              </label>
              <input
                id="matrixWidth"
                type="number"
                ref={matrixWidthRef}
                defaultValue="2"
                min="1"
                className="disable-physical-keypress-math-input-when-focused p-2 bg-transparent border border-airforce-princeton rounded-md text-center mb-3 text-blue-mainpagebeforeLogin border-blue-mainpagebeforeLogin"
              />
            </div>
          </div>
          {["pmatrix", "vmatrix"].map((id) => (
            <div
              key={id}
              id={id}
              className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center mb-3 text-blue-mainpagebeforeLogin border-blue-mainpagebeforeLogin  hover:bg-base-200 hover:text-white hover:border-white"
            ></div>
          ))}
        </div>
        <ul className="flex flex-col items-end justify-items-end space-y-4 w-full h-full ">
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce ">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Symbols of mathematical operations:{" "}
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {[
                  "plusminus",
                  "plus",
                  "minus",
                  "multiply",
                  "ratio",
                  "div",
                  "fraction",
                  "equal",
                  "approx",
                  "notEqual",
                  "lessThanOrEqual",
                  "greaterThanOrEqual",
                  "lessThan",
                  "greaterThan",
                ].map((id) => (
                  <li>
                    <div
                      key={id}
                      id={id}
                      className="p-2 bg-transparent border border-airforce-princeton rounded-md"
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Symbols of powers and roots:
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {["power", "subscript", "squareRoot", "3thRoot", "nthRoot"].map(
                  (id) => (
                    <li>
                      <div
                        key={id}
                        id={id}
                        className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center"
                      ></div>
                    </li>
                  )
                )}
              </ul>
            </div>
          </li>
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Function Symbols{" "}
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {[
                  "f(x)",
                  "sin",
                  "cos",
                  "tan",
                  "arcsin",
                  "arccos",
                  "arctan",
                  "cos-1",
                  "taninv",
                  "ln(x)",
                  "ln()",
                  "log(x)",
                  "log()",
                  "e",
                ].map((id) => (
                  <li className="mb-2">
                    <div
                      key={id}
                      id={id}
                      className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center"
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                String and Boundary Symbols:
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {["sum", "limit", "infty"].map((id) => (
                  <li>
                    <div
                      key={id}
                      id={id}
                      className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center"
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Symbols for integrals and derivatives:
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {["integral", "dx", "d/dx"].map((id) => (
                  <li>
                    <div
                      key={id}
                      id={id}
                      className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center"
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Geometric symbols:
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {[
                  "angle",
                  "perpendicular",
                  "paralel",
                  "degree",
                  "delta",
                  "pi",
                ].map((id) => (
                  <li>
                    <div
                      key={id}
                      id={id}
                      className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center"
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="w-full pl-10">
            <div className="collapse bg-base-200 rounded-lg shadow-md shadow-blue-mainpagebeforeLogin hover:bg-gunmetal-airforce">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Symbols for sets and mathematical logic:
              </div>
              <ul className="collapse-content flex flex-wrap space-x-2">
                {[
                  "not",
                  "or",
                  "and",
                  "isMemberOf",
                  "NotIn",
                  "naturalNumbers",
                  "integers",
                  "realNumbers",
                  "isProperSubsetOf",
                  "isSubsetOf",
                  "exists",
                  "forAll",
                  "doubleRightArrow",
                  "doubleLeftArrow",
                  "leftarrow",
                  "rightarrow",
                  "squareBrackets",
                  "curlyBrackets",
                  "pipes",
                  "doublePipes",
                ].map((id) => (
                  <li className="mb-2">
                    <div
                      key={id}
                      id={id}
                      className="p-2 bg-transparent border border-airforce-princeton rounded-md text-center"
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <h1 className="block sm:hidden font-bold font-roboto mt-6">
        Write easier with:
      </h1>
      <div className="sm:hidden grid grid-cols-3 gap-4 max-w-xs mx-auto mt-8 ">
        <button
          onClick={() => simulateKeyPress("ArrowUp", "ArrowUp", 38)}
          className="p-2 bg-blue-500 text-white rounded-md col-start-2"
        >
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <line
              x1="25"
              y1="75"
              x2="50"
              y2="25"
              stroke="black"
              strokeWidth="8" // Updated strokeWidth to match
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="25"
              x2="75"
              y2="75"
              stroke="black"
              strokeWidth="8" // Updated strokeWidth to match
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={() => simulateKeyPress("Backspace", "Backspace", 8)}
          className="p-2 bg-red-500 text-white rounded-md col-start-3"
        >
          <svg
            viewBox="0 0 200 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <polygon
              points="50,10 10,50 50,90 190,90 190,10"
              fill="none"
              stroke="black"
              strokeWidth="8"
              strokeLinejoin="round"
            />

            <line
              x1="120"
              y1="30"
              x2="160"
              y2="70"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="160"
              y1="30"
              x2="120"
              y2="70"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={() => simulateKeyPress("ArrowLeft", "ArrowLeft", 37)}
          className=" bg-blue-500 text-white rounded-md "
        >
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <line
              x1="75"
              y1="25"
              x2="25"
              y2="50"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="25"
              y1="50"
              x2="75"
              y2="75"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={() => simulateKeyPress("ArrowDown", "ArrowDown", 40)}
          className="p-2 bg-blue-500 text-white rounded-md col-start-2"
        >
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <line
              x1="25"
              y1="25"
              x2="50"
              y2="75"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="75"
              x2="75"
              y2="25"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={() => simulateKeyPress("ArrowRight", "ArrowRight", 39)}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <line
              x1="25"
              y1="25"
              x2="75"
              y2="50"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="75"
              y1="50"
              x2="25"
              y2="75"
              stroke="black"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-300">
        Note: if you have a physical keyboard attached, you can use that too.
        For example, try <kbd>^</kbd>, <kbd>*</kbd>, <kbd>(</kbd> and{" "}
        <kbd>/</kbd>. Use Shift + Left for selection mode (or use the blue key).
      </p>
    </div>
  );
};

export default MathInput;
