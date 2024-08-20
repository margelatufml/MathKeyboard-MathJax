/* eslint-disable */
// src/GetLatex/getEditModeLatex.ts
function getEditModeLatex(k, latexConfiguration) {
  return k.syntaxTreeRoot.getLatex(k, latexConfiguration);
}

// src/helpers/stringhelpers/isLetter.ts
function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
}

// src/helpers/stringhelpers/endsWithLatexCommand.ts
function endsWithLatexCommand(latex) {
  if (latex.length == 0) {
    return false;
  }
  if (isLetter(latex[latex.length - 1])) {
    for (let i = latex.length - 2; i >= 0; i--) {
      const c = latex[i];
      if (isLetter(c)) {
        continue;
      } else {
        return c == "\\";
      }
    }
  }
  return false;
}

// src/helpers/stringhelpers/concatLatex.ts
function concatLatex(...latexArray) {
  let s = "";
  for (let i = 0; i < latexArray.length; i++) {
    const latexToAdd = latexArray[i];
    if (endsWithLatexCommand(s) && isLetter(latexToAdd[0])) {
      s += " ";
    }
    s += latexToAdd;
  }
  return s;
}

// src/SyntaxTreeComponents/Placeholder/Placeholder.ts
var Placeholder = class {
  constructor() {
    this.parentNode = null;
    this.nodes = [];
  }
  getLatex(k, latexConfiguration) {
    const concatNodes = () =>
      concatLatex(
        ...this.nodes.map((node) => node.getLatex(k, latexConfiguration))
      );
    if (k.inclusiveSelectionLeftBorder === this) {
      return concatLatex(
        latexConfiguration.selectionHightlightStart,
        concatNodes()
      );
    } else if (this === k.current) {
      if (this.nodes.length == 0) {
        return latexConfiguration.activePlaceholderLatex;
      } else {
        return concatLatex(
          latexConfiguration.activePlaceholderLatex,
          concatNodes()
        );
      }
    } else if (this.nodes.length == 0) {
      return latexConfiguration.passivePlaceholderLatex;
    } else {
      return concatNodes();
    }
  }
};

// src/KeyboardEngine/KeyboardMemory.ts
var KeyboardMemory = class {
  constructor() {
    this.syntaxTreeRoot = new Placeholder();
    this.current = this.syntaxTreeRoot;
    this.selectionDiff = null;
    this.inclusiveSelectionRightBorder = null;
    this.inclusiveSelectionLeftBorder = null;
  }
};

// src/GetLatex/getViewModeLatex.ts
var emptyKeyboardMemory = new KeyboardMemory();
function getViewModeLatex(x, latexConfiguration) {
  const syntaxTreeComponent =
    x instanceof KeyboardMemory ? x.syntaxTreeRoot : x;
  return syntaxTreeComponent.getLatex(emptyKeyboardMemory, latexConfiguration);
}

// src/KeyboardEngine/Functions/helpers/getFirstNonEmptyOnLeftOf.ts
function getFirstNonEmptyOnLeftOf(placeholderArray, element) {
  let isOnTheLeft = false;
  for (let i = placeholderArray.length - 1; i >= 0; i--) {
    const placeholder = placeholderArray[i];
    if (!isOnTheLeft) {
      if (placeholder === element) {
        isOnTheLeft = true;
      }
      continue;
    }
    if (placeholder.nodes.length > 0) {
      return placeholder;
    }
  }
  return null;
}

// src/helpers/arrayhelpers/lastOrNull.ts
function lastOrNull(array) {
  return array.length == 0 ? null : array[array.length - 1];
}

// src/helpers/arrayhelpers/firstBeforeOrNull.ts
function firstBeforeOrNull(array, element) {
  const i = array.indexOf(element);
  if (i > 0) {
    return array[i - 1];
  } else {
    return null;
  }
}

// src/helpers/arrayhelpers/remove.ts
function remove(array, element) {
  const i = array.indexOf(element);
  array.splice(i, 1);
}

// src/SyntaxTreeComponents/Nodes/Base/TreeNode.ts
var TreeNode = class {
  getLatex(k, latexConfiguration) {
    let latex = this.getLatexPart(k, latexConfiguration);
    if (k.selectionDiff != null && k.selectionDiff != 0) {
      if (k.inclusiveSelectionLeftBorder === this) {
        latex = concatLatex(latexConfiguration.selectionHightlightStart, latex);
      }
      if (k.inclusiveSelectionRightBorder === this) {
        latex = concatLatex(latex, latexConfiguration.selectionHightlightEnd);
      }
      return latex;
    } else {
      if (k.current === this) {
        return concatLatex(latex, latexConfiguration.activePlaceholderLatex);
      } else {
        return latex;
      }
    }
  }
};

// src/SyntaxTreeComponents/Nodes/Base/BranchingNode.ts
var BranchingNode = class extends TreeNode {
  constructor(leftToRight) {
    super();
    this.placeholders = leftToRight;
    this.placeholders.forEach((ph) => {
      ph.parentNode = this;
    });
  }
  getMoveDownSuggestion(_fromPlaceholder) {
    return null;
  }
  getMoveUpSuggestion(_fromPlaceholder) {
    return null;
  }
};

// src/helpers/arrayhelpers/last.ts
function last(array) {
  return array[array.length - 1];
}

// src/SyntaxTreeComponents/Nodes/Base/LeafNode.ts
var LeafNode = class extends TreeNode {};

// src/SyntaxTreeComponents/Nodes/LeafNodes/Base/PartOfNumberWithDigits.ts
var PartOfNumberWithDigits = class extends LeafNode {};

// src/KeyboardEngine/Functions/helpers/encapsulateAllPartsOfNumberWithDigitsLeftOfIndex.ts
function encapsulateAllPartsOfNumberWithDigitsLeftOfIndex(
  exclusiveRightIndex,
  siblingNodes,
  toPlaceholder
) {
  for (let i = exclusiveRightIndex - 1; i >= 0; i--) {
    const siblingNode = siblingNodes[i];
    if (siblingNode instanceof PartOfNumberWithDigits) {
      remove(siblingNodes, siblingNode);
      toPlaceholder.nodes.unshift(siblingNode);
      siblingNode.parentPlaceholder = toPlaceholder;
    } else {
      break;
    }
  }
}

// src/KeyboardEngine/Functions/Deletion/helpers/deleteOuterBranchingNodeButNotItsContents.ts
function deleteOuterBranchingNodeButNotItsContents(nonEmptyPlaceholder) {
  const outerBranchingNode = nonEmptyPlaceholder.parentNode;
  const indexOfOuterBranchingNode =
    outerBranchingNode.parentPlaceholder.nodes.indexOf(outerBranchingNode);
  outerBranchingNode.parentPlaceholder.nodes.splice(
    indexOfOuterBranchingNode,
    1,
    ...nonEmptyPlaceholder.nodes
  );
  for (const node of nonEmptyPlaceholder.nodes) {
    node.parentPlaceholder = outerBranchingNode.parentPlaceholder;
  }
}

// src/KeyboardEngine/Functions/Deletion/deleteLeft.ts
function deleteLeft(k) {
  if (k.current instanceof Placeholder) {
    if (k.current.parentNode == null || k.current.nodes.length > 0) {
      return;
    } else {
      const nonEmptyPlaceholderOnLeft = getFirstNonEmptyOnLeftOf(
        k.current.parentNode.placeholders,
        k.current
      );
      if (nonEmptyPlaceholderOnLeft) {
        if (
          k.current.parentNode.placeholders.length == 2 &&
          k.current === k.current.parentNode.placeholders[1] &&
          k.current.nodes.length == 0
        ) {
          deleteOuterBranchingNodeButNotItsContents(nonEmptyPlaceholderOnLeft);
          k.current = last(nonEmptyPlaceholderOnLeft.nodes);
        } else {
          nonEmptyPlaceholderOnLeft.nodes.pop();
          k.current =
            lastOrNull(nonEmptyPlaceholderOnLeft.nodes) ??
            nonEmptyPlaceholderOnLeft;
        }
      } else if (
        k.current.parentNode.placeholders.every((ph) => ph.nodes.length == 0)
      ) {
        const ancestorPlaceholder = k.current.parentNode.parentPlaceholder;
        const previousNode = firstBeforeOrNull(
          ancestorPlaceholder.nodes,
          k.current.parentNode
        );
        remove(ancestorPlaceholder.nodes, k.current.parentNode);
        k.current = previousNode ?? ancestorPlaceholder;
      } else if (
        k.current.parentNode.placeholders[0] === k.current &&
        k.current.nodes.length == 0 &&
        k.current.parentNode.placeholders.some((ph) => ph.nodes.length != 0)
      ) {
        const previousNode = firstBeforeOrNull(
          k.current.parentNode.parentPlaceholder.nodes,
          k.current.parentNode
        );
        if (previousNode != null) {
          encapsulatePreviousInto(previousNode, k.current);
          k.current = last(k.current.nodes);
        } else {
          const nonEmptySiblingPlaceholders =
            k.current.parentNode.placeholders.filter(
              (p) => p.nodes.length != 0
            );
          if (nonEmptySiblingPlaceholders.length == 1) {
            const nodes = nonEmptySiblingPlaceholders[0].nodes;
            const ancestorPlaceholder = k.current.parentNode.parentPlaceholder;
            const indexOfParentNode = ancestorPlaceholder.nodes.indexOf(
              k.current.parentNode
            );
            for (const node of nodes) {
              node.parentPlaceholder = ancestorPlaceholder;
            }
            ancestorPlaceholder.nodes.splice(indexOfParentNode, 1, ...nodes);
            k.current = last(nodes);
          }
        }
      }
    }
  } else {
    if (
      k.current instanceof BranchingNode &&
      k.current.placeholders[0].nodes.length > 0 &&
      k.current.placeholders.slice(1).every((ph) => ph.nodes.length == 0)
    ) {
      const nonEmptyPlaceholder = k.current.placeholders[0];
      deleteOuterBranchingNodeButNotItsContents(nonEmptyPlaceholder);
      k.current = last(nonEmptyPlaceholder.nodes);
    } else if (
      k.current instanceof BranchingNode &&
      k.current.placeholders.some((ph) => ph.nodes.length > 0)
    ) {
      k.current = last(k.current.placeholders.flatMap((ph) => ph.nodes));
      deleteLeft(k);
    } else {
      const previousNode = firstBeforeOrNull(
        k.current.parentPlaceholder.nodes,
        k.current
      );
      remove(k.current.parentPlaceholder.nodes, k.current);
      k.current = previousNode ?? k.current.parentPlaceholder;
    }
  }
}
function encapsulatePreviousInto(previousNode, targetPlaceholder) {
  remove(targetPlaceholder.parentNode.parentPlaceholder.nodes, previousNode);
  targetPlaceholder.nodes.push(previousNode);
  const previousNodeOldParentPlaceholder = previousNode.parentPlaceholder;
  previousNode.parentPlaceholder = targetPlaceholder;
  if (previousNode instanceof PartOfNumberWithDigits) {
    encapsulateAllPartsOfNumberWithDigitsLeftOfIndex(
      previousNodeOldParentPlaceholder.nodes.length - 1,
      previousNodeOldParentPlaceholder.nodes,
      targetPlaceholder
    );
  }
}

// src/helpers/arrayhelpers/firstAfterOrNull.ts
function firstAfterOrNull(array, element) {
  const i = array.indexOf(element);
  if (i != -1 && i < array.length - 1) {
    return array[i + 1];
  } else {
    return null;
  }
}

// src/KeyboardEngine/Functions/Deletion/deleteRight.ts
function deleteRight(k) {
  if (k.current instanceof Placeholder) {
    if (
      k.current.parentNode != null &&
      k.current.parentNode.placeholders.every((ph) => ph.nodes.length == 0)
    ) {
      const previousNode = firstBeforeOrNull(
        k.current.parentNode.parentPlaceholder.nodes,
        k.current.parentNode
      );
      remove(
        k.current.parentNode.parentPlaceholder.nodes,
        k.current.parentNode
      );
      k.current = previousNode ?? k.current.parentNode.parentPlaceholder;
    } else {
      const nodes = k.current.nodes;
      if (nodes.length > 0) {
        handleDeletion(k, nodes[0]);
      } else if (k.current.parentNode != null) {
        const parentNode = k.current.parentNode;
        const siblingPlaceholders = parentNode.placeholders;
        if (
          siblingPlaceholders[0] == k.current &&
          siblingPlaceholders.length == 2
        ) {
          const nonEmptyPlaceholder = siblingPlaceholders[1];
          k.current =
            firstBeforeOrNull(parentNode.parentPlaceholder.nodes, parentNode) ??
            parentNode.parentPlaceholder;
          deleteOuterBranchingNodeButNotItsContents(nonEmptyPlaceholder);
        } else {
          for (
            let i = siblingPlaceholders.indexOf(k.current) + 1;
            i < siblingPlaceholders.length;
            i++
          ) {
            if (siblingPlaceholders[i].nodes.length > 0) {
              k.current = siblingPlaceholders[i];
              deleteRight(k);
              return;
            }
          }
        }
      }
    }
  } else {
    const nextNode = firstAfterOrNull(
      k.current.parentPlaceholder.nodes,
      k.current
    );
    if (nextNode != null) {
      handleDeletion(k, nextNode);
    }
  }
}
function handleDeletion(k, nextNode) {
  if (nextNode instanceof BranchingNode) {
    if (
      nextNode.placeholders.length == 1 &&
      nextNode.placeholders[0].nodes.length > 0
    ) {
      deleteOuterBranchingNodeButNotItsContents(nextNode.placeholders[0]);
    } else if (
      nextNode.placeholders.length == 2 &&
      nextNode.placeholders[0].nodes.length == 0 &&
      nextNode.placeholders[1].nodes.length > 0
    ) {
      deleteOuterBranchingNodeButNotItsContents(nextNode.placeholders[1]);
    } else {
      k.current = nextNode.placeholders[0];
      deleteRight(k);
    }
  } else {
    remove(nextNode.parentPlaceholder.nodes, nextNode);
  }
}

// src/KeyboardEngine/Functions/Selection/leaveSelectionMode.ts
function leaveSelectionMode(k) {
  k.selectionDiff = null;
  k.inclusiveSelectionRightBorder = null;
  k.inclusiveSelectionLeftBorder = null;
}

// src/KeyboardEngine/Functions/Selection/helpers/popSelection.ts
function popSelection(k) {
  if (k.selectionDiff == null) {
    throw "Enter selection mode before calling this method.";
  }
  if (k.selectionDiff == 0) {
    leaveSelectionMode(k);
    return [];
  }
  const diff = k.selectionDiff;
  if (k.current instanceof Placeholder) {
    leaveSelectionMode(k);
    return k.current.nodes.splice(0, diff);
  } else {
    const siblings = k.current.parentPlaceholder.nodes;
    const indexOfLeftBorder = siblings.indexOf(k.inclusiveSelectionLeftBorder);
    k.current =
      firstBeforeOrNull(siblings, k.inclusiveSelectionLeftBorder) ??
      k.current.parentPlaceholder;
    leaveSelectionMode(k);
    return siblings.splice(indexOfLeftBorder, abs(diff));
  }
}
function abs(n) {
  return n < 0 ? -n : n;
}

// src/KeyboardEngine/Functions/Deletion/deleteSelection.ts
function deleteSelection(k) {
  popSelection(k);
}

// src/KeyboardEngine/Functions/Navigation/moveRight.ts
function moveRight(k) {
  if (k.current instanceof Placeholder) {
    if (k.current.nodes.length > 0) {
      const nextNode = k.current.nodes[0];
      k.current =
        nextNode instanceof BranchingNode ? nextNode.placeholders[0] : nextNode;
    } else if (k.current.parentNode == null) {
      return;
    } else {
      k.current =
        firstAfterOrNull(k.current.parentNode.placeholders, k.current) ??
        k.current.parentNode;
    }
  } else {
    const nextNode = firstAfterOrNull(
      k.current.parentPlaceholder.nodes,
      k.current
    );
    if (nextNode != null) {
      k.current =
        nextNode instanceof BranchingNode ? nextNode.placeholders[0] : nextNode;
    } else {
      const ancestorNode = k.current.parentPlaceholder.parentNode;
      if (ancestorNode != null) {
        const nextPlaceholder = firstAfterOrNull(
          ancestorNode.placeholders,
          k.current.parentPlaceholder
        );
        k.current = nextPlaceholder ?? ancestorNode;
      }
    }
  }
}

// src/KeyboardEngine/Functions/Insertion/insert.ts
function insert(k, toInsert) {
  if (toInsert instanceof Array) {
    for (const node of toInsert) {
      insert(k, node);
      k.current = node;
    }
  } else {
    if (k.current instanceof Placeholder) {
      k.current.nodes.unshift(toInsert);
      toInsert.parentPlaceholder = k.current;
    } else {
      const parent = k.current.parentPlaceholder;
      const indexOfCurrent = parent.nodes.indexOf(k.current);
      parent.nodes.splice(indexOfCurrent + 1, 0, toInsert);
      toInsert.parentPlaceholder = parent;
    }
    moveRight(k);
  }
}

// src/SyntaxTreeComponents/Nodes/BranchingNodes/StandardBranchingNode.ts
var StandardBranchingNode = class extends BranchingNode {
  constructor(before, then, ...rest) {
    const placeholderCount = rest.length + 1;
    const placeholders = new Array();
    for (let i = 0; i < placeholderCount; i++) {
      placeholders.push(new Placeholder());
    }
    super(placeholders);
    this.before = before;
    this.then = then;
    this.rest = rest;
  }
  getLatexPart(k, latexConfiguration) {
    let latex =
      this.before +
      this.placeholders[0].getLatex(k, latexConfiguration) +
      this.then;
    for (let i = 0; i < this.rest.length; i++) {
      latex +=
        this.placeholders[i + 1].getLatex(k, latexConfiguration) + this.rest[i];
    }
    return latex;
  }
};

// src/SyntaxTreeComponents/Nodes/BranchingNodes/RoundBracketsNode.ts
var RoundBracketsNode = class extends StandardBranchingNode {
  constructor(
    leftBracketLatex = String.raw`\left(`,
    rightBracketLatex = String.raw`\right)`
  ) {
    super(leftBracketLatex, rightBracketLatex);
  }
};

// src/KeyboardEngine/Functions/helpers/encapsulate.ts
function encapsulate(nodes, encapsulatingPlaceholder) {
  for (const node of nodes) {
    node.parentPlaceholder = encapsulatingPlaceholder;
    encapsulatingPlaceholder.nodes.push(node);
  }
}

// src/KeyboardEngine/Functions/Insertion/insertWithEncapsulateCurrent.ts
function insertWithEncapsulateCurrent(k, newNode, config) {
  const encapsulatingPlaceholder = newNode.placeholders[0];
  if (k.current instanceof TreeNode) {
    const siblingNodes = k.current.parentPlaceholder.nodes;
    const currentIndex = siblingNodes.indexOf(k.current);
    siblingNodes[currentIndex] = newNode;
    newNode.parentPlaceholder = k.current.parentPlaceholder;
    if (
      k.current instanceof RoundBracketsNode &&
      config?.deleteOuterRoundBracketsIfAny
    ) {
      encapsulate(k.current.placeholders[0].nodes, encapsulatingPlaceholder);
      k.current =
        firstAfterOrNull(newNode.placeholders, encapsulatingPlaceholder) ??
        newNode;
    } else if (k.current instanceof PartOfNumberWithDigits) {
      encapsulatingPlaceholder.nodes.push(k.current);
      k.current.parentPlaceholder = encapsulatingPlaceholder;
      encapsulateAllPartsOfNumberWithDigitsLeftOfIndex(
        currentIndex,
        siblingNodes,
        encapsulatingPlaceholder
      );
      moveRight(k);
    } else {
      encapsulatingPlaceholder.nodes.push(k.current);
      k.current.parentPlaceholder = encapsulatingPlaceholder;
      moveRight(k);
    }
  } else {
    insert(k, newNode);
  }
}

// src/KeyboardEngine/Functions/Insertion/insertWithEncapsulateSelection.ts
function insertWithEncapsulateSelection(k, newNode) {
  const selection = popSelection(k);
  insert(k, newNode);
  if (selection.length > 0) {
    const encapsulatingPlaceholder = newNode.placeholders[0];
    encapsulate(selection, encapsulatingPlaceholder);
    k.current = last(selection);
    moveRight(k);
  }
}

// src/KeyboardEngine/Functions/Insertion/insertWithEncapsulateSelectionAndPrevious.ts
function insertWithEncapsulateSelectionAndPrevious(k, newNode) {
  if (newNode.placeholders.length < 2) {
    throw "Expected 2 placeholders.";
  }
  const selection = popSelection(k);
  const secondPlaceholder = newNode.placeholders[1];
  encapsulate(selection, secondPlaceholder);
  insertWithEncapsulateCurrent(k, newNode);
  k.current = lastOrNull(selection) ?? secondPlaceholder;
}

// src/KeyboardEngine/Functions/Navigation/moveDown.ts
function moveDown(k) {
  let fromPlaceholder =
    k.current instanceof Placeholder ? k.current : k.current.parentPlaceholder;
  let suggestingNode;
  while (true) {
    if (fromPlaceholder.parentNode == null) {
      return;
    }
    suggestingNode = fromPlaceholder.parentNode;
    const suggestion = suggestingNode.getMoveDownSuggestion(fromPlaceholder);
    if (suggestion != null) {
      k.current = lastOrNull(suggestion.nodes) ?? suggestion;
      return;
    }
    fromPlaceholder = suggestingNode.parentPlaceholder;
  }
}

// src/KeyboardEngine/Functions/Navigation/moveLeft.ts
function moveLeft(k) {
  if (k.current instanceof Placeholder) {
    if (k.current.parentNode == null) {
      return;
    }
    const previousPlaceholder = firstBeforeOrNull(
      k.current.parentNode.placeholders,
      k.current
    );
    if (previousPlaceholder !== null) {
      k.current = lastOrNull(previousPlaceholder.nodes) ?? previousPlaceholder;
    } else {
      const ancestorPlaceholder = k.current.parentNode.parentPlaceholder;
      const nodePreviousToParentOfCurrent = firstBeforeOrNull(
        ancestorPlaceholder.nodes,
        k.current.parentNode
      );
      k.current = nodePreviousToParentOfCurrent ?? ancestorPlaceholder;
    }
  } else {
    if (k.current instanceof BranchingNode) {
      const placeholder = last(k.current.placeholders);
      k.current = lastOrNull(placeholder.nodes) ?? placeholder;
    } else {
      k.current =
        firstBeforeOrNull(k.current.parentPlaceholder.nodes, k.current) ??
        k.current.parentPlaceholder;
    }
  }
}

// src/KeyboardEngine/Functions/Navigation/moveUp.ts
function moveUp(k) {
  let fromPlaceholder =
    k.current instanceof Placeholder ? k.current : k.current.parentPlaceholder;
  let suggestingNode;
  while (true) {
    if (fromPlaceholder.parentNode == null) {
      return;
    }
    suggestingNode = fromPlaceholder.parentNode;
    const suggestion = suggestingNode.getMoveUpSuggestion(fromPlaceholder);
    if (suggestion != null) {
      k.current = lastOrNull(suggestion.nodes) ?? suggestion;
      return;
    }
    fromPlaceholder = suggestingNode.parentPlaceholder;
  }
}

// src/KeyboardEngine/Functions/Selection/helpers/setSelectionDiff.ts
function setSelectionDiff(k, diffWithCurrent) {
  k.selectionDiff = diffWithCurrent;
  if (diffWithCurrent == 0) {
    k.inclusiveSelectionLeftBorder = null;
    k.inclusiveSelectionRightBorder = null;
  } else if (k.current instanceof Placeholder) {
    k.inclusiveSelectionLeftBorder = k.current;
    k.inclusiveSelectionRightBorder = k.current.nodes[diffWithCurrent - 1];
  } else {
    const nodes = k.current.parentPlaceholder.nodes;
    const indexOfCurrent = nodes.indexOf(k.current);
    if (diffWithCurrent > 0) {
      k.inclusiveSelectionLeftBorder = nodes[indexOfCurrent + 1];
      k.inclusiveSelectionRightBorder = nodes[indexOfCurrent + diffWithCurrent];
    } else {
      const indexOfNewInclusiveSelectionLeftBorder =
        indexOfCurrent + diffWithCurrent + 1;
      if (indexOfNewInclusiveSelectionLeftBorder < 0) {
        throw "The TreeNode at index 0 of the current Placeholder is as far as you can go left if current is a TreeNode.";
      }
      k.inclusiveSelectionLeftBorder =
        nodes[indexOfNewInclusiveSelectionLeftBorder];
      k.inclusiveSelectionRightBorder = k.current;
    }
  }
}

// src/KeyboardEngine/Functions/Selection/enterSelectionMode.ts
function enterSelectionMode(k) {
  setSelectionDiff(k, 0);
}

// src/KeyboardEngine/Functions/Selection/inSelectionMode.ts
function inSelectionMode(k) {
  return k.selectionDiff != null;
}

// src/KeyboardEngine/Functions/Selection/selectLeft.ts
function selectLeft(k) {
  const oldDiffWithCurrent = k.selectionDiff ?? 0;
  if (
    (k.current instanceof TreeNode &&
      k.current.parentPlaceholder.nodes.indexOf(k.current) +
        oldDiffWithCurrent >=
        0) ||
    (k.current instanceof Placeholder && oldDiffWithCurrent > 0)
  ) {
    setSelectionDiff(k, oldDiffWithCurrent - 1);
  } else if (
    k.inclusiveSelectionLeftBorder instanceof TreeNode &&
    k.inclusiveSelectionLeftBorder.parentPlaceholder.nodes.indexOf(
      k.inclusiveSelectionLeftBorder
    ) == 0 &&
    k.inclusiveSelectionLeftBorder.parentPlaceholder.parentNode != null
  ) {
    k.current = k.inclusiveSelectionLeftBorder.parentPlaceholder.parentNode;
    setSelectionDiff(k, -1);
  }
}

// src/KeyboardEngine/Functions/Selection/selectRight.ts
function selectRight(k) {
  const oldDiffWithCurrent = k.selectionDiff ?? 0;
  if (
    (k.current instanceof Placeholder &&
      oldDiffWithCurrent < k.current.nodes.length) ||
    (k.current instanceof TreeNode &&
      k.current.parentPlaceholder.nodes.indexOf(k.current) +
        oldDiffWithCurrent <
        k.current.parentPlaceholder.nodes.length - 1)
  ) {
    setSelectionDiff(k, oldDiffWithCurrent + 1);
  } else if (
    k.inclusiveSelectionRightBorder instanceof TreeNode &&
    last(k.inclusiveSelectionRightBorder.parentPlaceholder.nodes) ==
      k.inclusiveSelectionRightBorder &&
    k.inclusiveSelectionRightBorder.parentPlaceholder.parentNode != null
  ) {
    const ancestorNode =
      k.inclusiveSelectionRightBorder.parentPlaceholder.parentNode;
    k.current =
      firstBeforeOrNull(ancestorNode.parentPlaceholder.nodes, ancestorNode) ??
      ancestorNode.parentPlaceholder;
    setSelectionDiff(k, 1);
  }
}

// src/LatexParser/LatexParserConfiguration.ts
var LatexParserConfiguration = class {
  constructor() {
    this.additionalDigits = null;
    this.decimalSeparatorMatchers = [".", "{,}"];
    this.preferRoundBracketsNode = true;
  }
};

// src/SyntaxTreeComponents/Nodes/BranchingNodes/AscendingBranchingNode.ts
var AscendingBranchingNode = class extends StandardBranchingNode {
  getMoveDownSuggestion(fromPlaceholder) {
    const currentPlaceholderIndex = this.placeholders.indexOf(fromPlaceholder);
    if (currentPlaceholderIndex > 0) {
      return this.placeholders[currentPlaceholderIndex - 1];
    } else {
      return null;
    }
  }
  getMoveUpSuggestion(fromPlaceholder) {
    const currentPlaceholderIndex = this.placeholders.indexOf(fromPlaceholder);
    if (currentPlaceholderIndex < this.placeholders.length - 1) {
      return this.placeholders[currentPlaceholderIndex + 1];
    } else {
      return null;
    }
  }
};

// src/SyntaxTreeComponents/Nodes/LeafNodes/DecimalSeparatorNode.ts
var DecimalSeparatorNode = class extends PartOfNumberWithDigits {
  constructor(latex = ".") {
    super();
    this.latex = typeof latex === "string" ? () => latex : latex;
  }
  getLatexPart(_k, _latexConfiguration) {
    return this.latex();
  }
};

// src/SyntaxTreeComponents/Nodes/BranchingNodes/DescendingBranchingNode.ts
var DescendingBranchingNode = class extends StandardBranchingNode {
  getMoveDownSuggestion(fromPlaceholder) {
    const currentPlaceholderIndex = this.placeholders.indexOf(fromPlaceholder);
    if (currentPlaceholderIndex < this.placeholders.length - 1) {
      return this.placeholders[currentPlaceholderIndex + 1];
    } else {
      return null;
    }
  }
  getMoveUpSuggestion(fromPlaceholder) {
    const currentPlaceholderIndex = this.placeholders.indexOf(fromPlaceholder);
    if (currentPlaceholderIndex > 0) {
      return this.placeholders[currentPlaceholderIndex - 1];
    } else {
      return null;
    }
  }
};

// src/SyntaxTreeComponents/Nodes/LeafNodes/DigitNode.ts
var DigitNode = class extends PartOfNumberWithDigits {
  constructor(digit) {
    super();
    this.latex = digit;
  }
  getLatexPart(_k, _latexConfiguration) {
    return this.latex;
  }
};

// src/SyntaxTreeComponents/Nodes/LeafNodes/StandardLeafNode.ts
var StandardLeafNode = class extends LeafNode {
  constructor(latex) {
    super();
    this.latex = typeof latex === "string" ? () => latex : latex;
  }
  getLatexPart(_k, _latexConfiguration) {
    return this.latex();
  }
};

// src/LatexParser/helpers/getBracketPairContent.ts
function getBracketPairContent(opening, closing, sWithOpening) {
  const openingBracket = opening.slice(-1);
  const s = sWithOpening.slice(opening.length);
  let level = 0;
  for (
    let closingBracketIndex = 0;
    closingBracketIndex < s.length;
    closingBracketIndex++
  ) {
    if (
      s.substring(closingBracketIndex, closingBracketIndex + closing.length) ==
      closing
    ) {
      if (level == 0) {
        return {
          content: s.slice(0, closingBracketIndex),
          rest: s.slice(closingBracketIndex + closing.length),
        };
      } else {
        level--;
        continue;
      }
    }
    const toIgnores = [
      "\\" + openingBracket,
      "\\" + closing,
      String.raw`\left` + openingBracket,
      String.raw`\right` + closing,
    ];
    const currentPosition = s.slice(closingBracketIndex);
    for (const toIgnore of toIgnores) {
      if (
        currentPosition.length >= toIgnore.length &&
        currentPosition.startsWith(toIgnore)
      ) {
        closingBracketIndex += toIgnore.length;
        continue;
      }
    }
    if (s[closingBracketIndex] == openingBracket) {
      level++;
    }
  }
  throw `A closing ${closing} is missing.`;
}

// src/SyntaxTreeComponents/Nodes/BranchingNodes/MatrixNode.ts
var MatrixNode = class extends BranchingNode {
  constructor(matrixType, width, height) {
    const grid = [];
    const leftToRight = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        const placeholder = new Placeholder();
        row.push(placeholder);
        leftToRight.push(placeholder);
      }
      grid.push(row);
    }
    super(leftToRight);
    this.grid = grid;
    this.matrixType = matrixType;
    this.width = width;
  }
  getLatexPart(k, latexConfiguration) {
    let latex = String.raw`\begin{${this.matrixType}}`;
    latex += this.grid
      .map((row) =>
        row
          .map((placeholder) => placeholder.getLatex(k, latexConfiguration))
          .join(" & ")
      )
      .join(String.raw` \\ `);
    latex += String.raw`\end{${this.matrixType}}`;
    return latex;
  }
  getMoveDownSuggestion(fromPlaceholder) {
    const { rowIndex, columnIndex } = this.getPositionOf(fromPlaceholder);
    if (rowIndex + 1 < this.grid.length) {
      return this.grid[rowIndex + 1][columnIndex];
    } else {
      return null;
    }
  }
  getMoveUpSuggestion(fromPlaceholder) {
    const { rowIndex, columnIndex } = this.getPositionOf(fromPlaceholder);
    if (rowIndex - 1 >= 0) {
      return this.grid[rowIndex - 1][columnIndex];
    } else {
      return null;
    }
  }
  getPositionOf(placeholder) {
    const index = this.placeholders.indexOf(placeholder);
    if (index == -1) {
      throw "The provided Placeholder is not part of this MatrixNode.";
    }
    const rowIndex = Math.floor(index / this.width);
    const columnIndex = index - rowIndex * this.width;
    return { rowIndex, columnIndex };
  }
};

// src/LatexParser/parseLatex.ts
function parseLatex(
  latex,
  latexParserConfiguration = new LatexParserConfiguration()
) {
  if (latex == null) {
    return new KeyboardMemory();
  }
  let x = latex.trim();
  const k = new KeyboardMemory();
  while (x != "") {
    if (x[0] == " ") {
      x = x.trimStart();
      continue;
    }
    const decimalSeparatorMatch =
      latexParserConfiguration.decimalSeparatorMatchers.find((pattern) =>
        x.startsWith(pattern)
      );
    if (decimalSeparatorMatch != null) {
      insert(
        k,
        new DecimalSeparatorNode(
          latexParserConfiguration.preferredDecimalSeparator ??
            decimalSeparatorMatch
        )
      );
      x = x.slice(decimalSeparatorMatch.length);
      continue;
    }
    if (
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(x[0]) ||
      latexParserConfiguration.additionalDigits?.includes(x[0])
    ) {
      insert(k, new DigitNode(x[0]));
      x = x.slice(1);
      continue;
    }
    let handled = false;
    if (x.startsWith(String.raw`\begin{`)) {
      const matrixTypeAndRest = getBracketPairContent(
        String.raw`\begin{`,
        "}",
        x
      );
      if (
        !matrixTypeAndRest.content.endsWith("matrix") &&
        !matrixTypeAndRest.content.endsWith("cases")
      ) {
        throw String.raw`Expected a word ending with 'matrix' or 'cases' after '\begin{'.`;
      }
      const matrixContent = matrixTypeAndRest.rest.slice(
        0,
        matrixTypeAndRest.rest.indexOf(
          String.raw`\end{${matrixTypeAndRest.content}}`
        )
      );
      const lines = matrixContent.split(String.raw`\\`);
      insert(
        k,
        new MatrixNode(
          matrixTypeAndRest.content,
          lines[0].split("&").length,
          lines.length
        )
      );
      for (const line of lines) {
        for (const latex2 of line.split("&")) {
          const nodes = parseLatex(latex2, latexParserConfiguration)
            .syntaxTreeRoot.nodes;
          insert(k, nodes);
          moveRight(k);
        }
      }
      const matrixEnd = String.raw`\end{${matrixTypeAndRest.content}}`;
      x = x.slice(x.indexOf(matrixEnd) + matrixEnd.length);
      continue;
    }
    if (
      latexParserConfiguration.preferRoundBracketsNode &&
      (x[0] == "(" || x.startsWith(String.raw`\left(`))
    ) {
      const opening = x[0] == "(" ? "(" : String.raw`\left(`;
      const closing = x[0] == "(" ? ")" : String.raw`\right)`;
      const bracketsNode = new RoundBracketsNode(opening, closing);
      insert(k, bracketsNode);
      const bracketsContentAndRest = getBracketPairContent(opening, closing, x);
      const bracketsContentNodes = parseLatex(
        bracketsContentAndRest.content,
        latexParserConfiguration
      ).syntaxTreeRoot.nodes;
      insert(k, bracketsContentNodes);
      k.current = bracketsNode;
      x = bracketsContentAndRest.rest;
      continue;
    }
    if (x.startsWith("\\")) {
      for (const prefix of [
        "\\left\\",
        "\\right\\",
        String.raw`\left`,
        String.raw`\right`,
      ]) {
        if (x.startsWith(prefix) && !isLetter(x[prefix.length])) {
          insert(k, new StandardLeafNode(prefix + x[prefix.length]));
          x = x.slice(prefix.length + 1);
          handled = true;
          break;
        }
      }
      if (handled) {
        continue;
      }
      const textOpening = String.raw`\text{`;
      if (x.startsWith(textOpening)) {
        const bracketPairContentAndRest = getBracketPairContent(
          textOpening,
          "}",
          x
        );
        const textNode = new StandardBranchingNode(textOpening, "}");
        insert(k, textNode);
        for (const character of bracketPairContentAndRest.content) {
          insert(k, new StandardLeafNode(character));
        }
        k.current = textNode;
        x = bracketPairContentAndRest.rest;
        continue;
      }
      let command = "\\";
      if (isLetter(x[1])) {
        for (let i = 1; i < x.length; i++) {
          const character = x[i];
          if (isLetter(character)) {
            command += character;
          } else if (character == "{" || character == "[") {
            const opening = command + character;
            const closingBracket1 = character == "{" ? "}" : "]";
            const bracketPair1ContentAndRest = getBracketPairContent(
              opening,
              closingBracket1,
              x
            );
            const placeholder1Nodes = parseLatex(
              bracketPair1ContentAndRest.content,
              latexParserConfiguration
            ).syntaxTreeRoot.nodes;
            if (bracketPair1ContentAndRest.rest[0] == "{") {
              const multiPlaceholderBranchingNode = new DescendingBranchingNode(
                opening,
                closingBracket1 + "{",
                "}"
              );
              insert(k, multiPlaceholderBranchingNode);
              insert(k, placeholder1Nodes);
              moveRight(k);
              const bracketPair2ContentAndRest = getBracketPairContent(
                "{",
                "}",
                bracketPair1ContentAndRest.rest
              );
              const placeholder2Nodes = parseLatex(
                bracketPair2ContentAndRest.content,
                latexParserConfiguration
              ).syntaxTreeRoot.nodes;
              insert(k, placeholder2Nodes);
              k.current = multiPlaceholderBranchingNode;
              x = bracketPair2ContentAndRest.rest;
            } else {
              const singlePlaceholderBranchingNode = new StandardBranchingNode(
                opening,
                closingBracket1
              );
              insert(k, singlePlaceholderBranchingNode);
              insert(k, placeholder1Nodes);
              k.current = singlePlaceholderBranchingNode;
              x = bracketPair1ContentAndRest.rest;
            }
            handled = true;
            break;
          } else {
            break;
          }
        }
        if (handled) {
          continue;
        }
        insert(k, new StandardLeafNode(command));
        x = x.slice(command.length);
      } else {
        insert(k, new StandardLeafNode("\\" + x[1]));
        x = x.slice(2);
      }
      continue;
    }
    if (x.startsWith("_{")) {
      const opening = "_{";
      const closingBracket1 = "}";
      const bracketPair1ContentAndRest = getBracketPairContent(
        opening,
        closingBracket1,
        x
      );
      if (bracketPair1ContentAndRest.rest.startsWith("^{")) {
        const ascendingBranchingNode = new AscendingBranchingNode(
          opening,
          "}^{",
          "}"
        );
        insert(k, ascendingBranchingNode);
        const placeholder1Nodes = parseLatex(
          bracketPair1ContentAndRest.content,
          latexParserConfiguration
        ).syntaxTreeRoot.nodes;
        insert(k, placeholder1Nodes);
        moveRight(k);
        const bracketPair2ContentAndRest = getBracketPairContent(
          "^{",
          "}",
          bracketPair1ContentAndRest.rest
        );
        const placeholder2Nodes = parseLatex(
          bracketPair2ContentAndRest.content,
          latexParserConfiguration
        ).syntaxTreeRoot.nodes;
        insert(k, placeholder2Nodes);
        k.current = ascendingBranchingNode;
        x = bracketPair2ContentAndRest.rest;
        continue;
      }
    }
    const various = [
      ["^{", () => new AscendingBranchingNode("", "^{", "}")],
      ["_{", () => new DescendingBranchingNode("", "_{", "}")],
    ];
    for (const opening_getTreeNode of various) {
      const opening = opening_getTreeNode[0];
      if (x.startsWith(opening)) {
        const node = opening_getTreeNode[1]();
        insertWithEncapsulateCurrent(k, node);
        const bracketPairContentAndRest = getBracketPairContent(
          opening,
          "}",
          x
        );
        const secondPlaceholderNodes = parseLatex(
          bracketPairContentAndRest.content,
          latexParserConfiguration
        ).syntaxTreeRoot.nodes;
        insert(k, secondPlaceholderNodes);
        k.current = node;
        x = bracketPairContentAndRest.rest;
        handled = true;
        break;
      }
    }
    if (handled) {
      continue;
    }
    insert(k, new StandardLeafNode(x[0]));
    x = x.slice(1);
    continue;
  }
  return k;
}

// src/LatexConfiguration.ts
var LatexConfiguration = class {
  constructor() {
    this.activePlaceholderShape = String.raw`\blacksquare`;
    this.passivePlaceholderShape = String.raw`\square`;
    this.selectionHightlightStart = String.raw`\colorbox{#ADD8E6}{\(\displaystyle`;
    this.selectionHightlightEnd = String.raw`\)}`;
  }
  get activePlaceholderLatex() {
    if (this.activePlaceholderColor == null) {
      return this.activePlaceholderShape;
    } else {
      return String.raw`{\color{${this.activePlaceholderColor}}${this.activePlaceholderShape}}`;
    }
  }
  get passivePlaceholderLatex() {
    if (this.passivePlaceholderColor == null) {
      return this.passivePlaceholderShape;
    } else {
      return String.raw`{\color{${this.passivePlaceholderColor}}${this.passivePlaceholderShape}}`;
    }
  }
};
export {
  AscendingBranchingNode,
  BranchingNode,
  DecimalSeparatorNode,
  DescendingBranchingNode,
  DigitNode,
  KeyboardMemory,
  LatexConfiguration,
  LatexParserConfiguration,
  LeafNode,
  MatrixNode,
  Placeholder,
  RoundBracketsNode,
  StandardBranchingNode,
  StandardLeafNode,
  TreeNode,
  deleteLeft,
  deleteRight,
  deleteSelection,
  enterSelectionMode,
  getEditModeLatex,
  getViewModeLatex,
  inSelectionMode,
  insert,
  insertWithEncapsulateCurrent,
  insertWithEncapsulateSelection,
  insertWithEncapsulateSelectionAndPrevious,
  leaveSelectionMode,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  parseLatex,
  selectLeft,
  selectRight,
};
/* eslint-enable */
