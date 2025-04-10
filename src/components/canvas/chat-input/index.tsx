import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import CodeMirror from "@uiw/react-codemirror";
import { Extension, EditorState, Text } from "@codemirror/state";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { useTheme } from "../../theme/theme-provider";
import {
  contextOptions,
  getContextDisplayName,
  getContextDescription,
  getContextKind,
  getContextSectionTitle,
  updateKeyValueContextValue,
  shouldReplaceContext,
} from "./types";
import { ContextReference, KeyValueContextElement } from "../chat/types";
import { baseTheme, lightThemeVars, darkThemeVars } from "./theme"; // Import theme

const ChatInput: React.FC = () => {
  // --- State ---
  const [value, setValue] = useState<string>("Type your message here");
  const [selectedContexts, setSelectedContexts] = useState<ContextReference[]>(
    []
  );
  const [isToolbarMenuOpen, setIsToolbarMenuOpen] = useState(false);
  const [toolbarSearchTerm, setToolbarSearchTerm] = useState("");
  const [toolbarSelectedItemIndex, setToolbarSelectedItemIndex] = useState(-1);
  const [activeDropdownContextId, setActiveDropdownContextId] = useState<
    string | null
  >(null);
  const [customValueInput, setCustomValueInput] = useState<string>("");
  const { theme } = useTheme();

  // --- Refs ---
  const editorViewRef = useRef<EditorView | null>(null);
  const toolbarMenuRef = useRef<HTMLDivElement>(null);
  const toolbarButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  // Ref to store the last known cursor position in the editor
  const lastCursorPosRef = useRef<number | null>(null);

  // --- Helper Functions ---

  /**
   * Focuses the CodeMirror editor and restores the cursor position if known.
   * Uses setTimeout to ensure focus happens after potential state updates/renders.
   */
  const focusEditorAndRestoreCursor = useCallback(() => {
    setTimeout(() => {
      if (editorViewRef.current) {
        editorViewRef.current.focus();
        if (lastCursorPosRef.current !== null) {
          const pos = lastCursorPosRef.current;
          // Dispatch a transaction to update the selection
          const transaction = editorViewRef.current.state.update({
            selection: { anchor: pos, head: pos },
          });
          editorViewRef.current.dispatch(transaction);
          lastCursorPosRef.current = null; // Reset after restoring
        }
      }
    }, 0); // Execute on the next tick
  }, []);

  /**
   * Saves the current cursor position from the editor view.
   */
  const saveCursorPosition = useCallback(() => {
    if (editorViewRef.current) {
      lastCursorPosRef.current =
        editorViewRef.current.state.selection.main.head;
    }
  }, []);

  // --- Context Management Callbacks ---

  /**
   * Adds a new context item or replaces an existing one based on replacement rules.
   */
  const addContext = useCallback((contextToAdd: ContextReference) => {
    setSelectedContexts((prevContexts) => {
      const newContexts = [...prevContexts];
      let replaced = false;
      for (let i = 0; i < newContexts.length; i++) {
        if (shouldReplaceContext(newContexts[i], contextToAdd)) {
          newContexts[i] = contextToAdd;
          replaced = true;
          break;
        }
      }
      if (!replaced) {
        newContexts.push(contextToAdd);
      }
      return newContexts;
    });
    // Close the toolbar menu after adding
    setIsToolbarMenuOpen(false);
  }, []); // No external state dependencies needed here

  /**
   * Removes a context item by its ID.
   */
  const removeContext = useCallback((contextId: string) => {
    setSelectedContexts((prev) => prev.filter((ctx) => ctx.id !== contextId));
  }, []);

  /**
   * Updates a KeyValueContextElement with a new value (from dropdown or custom input).
   */
  const updateKeyValueContext = useCallback(
    (context: KeyValueContextElement, newValue: string) => {
      const updatedContext = updateKeyValueContextValue(context, newValue);
      setSelectedContexts((prevContexts) =>
        prevContexts.map((ctx) =>
          ctx.id === context.id ? updatedContext : ctx
        )
      );
      // Close dropdown and reset input
      setActiveDropdownContextId(null);
      setCustomValueInput("");
      // Return focus to the editor
      focusEditorAndRestoreCursor();
    },
    [focusEditorAndRestoreCursor] // Depends on the focus helper
  );

  // --- Key-Value Context Dropdown Handlers ---

  const toggleDropdown = useCallback(
    (contextId: string) => {
      setActiveDropdownContextId((prev) =>
        prev === contextId ? null : contextId
      );
      setCustomValueInput(""); // Reset custom input when toggling
      // Save cursor position when opening a dropdown for potential focus return
      if (activeDropdownContextId !== contextId) {
        saveCursorPosition();
      }
    },
    [activeDropdownContextId, saveCursorPosition]
  );

  const handleSelectOption = useCallback(
    (context: KeyValueContextElement, option: string) => {
      updateKeyValueContext(context, option);
    },
    [updateKeyValueContext] // Depends on the core update logic
  );

  const handleCustomValueSubmit = useCallback(
    (context: KeyValueContextElement) => {
      if (customValueInput.trim()) {
        updateKeyValueContext(context, customValueInput.trim());
      }
    },
    [customValueInput, updateKeyValueContext] // Depends on input state and update logic
  );

  const handleCustomInputKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      context: KeyValueContextElement
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCustomValueSubmit(context);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setActiveDropdownContextId(null);
        setCustomValueInput("");
        focusEditorAndRestoreCursor(); // Return focus on Escape
      }
    },
    [handleCustomValueSubmit, focusEditorAndRestoreCursor] // Depends on submit and focus logic
  );

  // --- Toolbar Context Menu Handlers ---

  const handleToggleToolbarMenu = useCallback(() => {
    // Save cursor position before opening the menu
    if (!isToolbarMenuOpen) {
      saveCursorPosition();
    }
    setIsToolbarMenuOpen(!isToolbarMenuOpen);
    setToolbarSearchTerm(""); // Reset search on toggle
    setToolbarSelectedItemIndex(-1); // Reset selection on toggle

    // Focus search input when opening
    if (!isToolbarMenuOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 10);
    } else {
      // If closing manually, return focus to editor
      focusEditorAndRestoreCursor();
    }
  }, [isToolbarMenuOpen, saveCursorPosition, focusEditorAndRestoreCursor]);

  const handleSelectContextFromMenu = useCallback(
    (context: ContextReference) => {
      addContext(context); // Add the context
      focusEditorAndRestoreCursor(); // Return focus to editor
    },
    [addContext, focusEditorAndRestoreCursor] // Depends on add and focus logic
  );

  const handleToolbarSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setToolbarSearchTerm(e.target.value);
      setToolbarSelectedItemIndex(-1); // Reset selection when search term changes
    },
    []
  );

  // --- CodeMirror Editor Handlers ---

  /**
   * Handles changes in the CodeMirror editor value.
   * Detects '/' typed after a space or at the start to open the context menu.
   */
  const onEditorChange = useCallback(
    (newValue: string, viewUpdate: ViewUpdate) => {
      setValue(newValue);

      // Check if '/' was typed in a context that should trigger the menu
      let slashTypedForMenu = false;
      if (viewUpdate.transactions.length > 0) {
        const transaction = viewUpdate.transactions[0];
        if (transaction.isUserEvent("input.type")) {
          transaction.changes.iterChanges(
            (fromA, toA, fromB, toB, inserted) => {
              if (inserted.length === 1 && inserted.toString() === "/") {
                const insertPos = fromB;
                const doc = viewUpdate.state.doc;
                const isAtStart = insertPos === 0;
                const isAfterSpace =
                  insertPos > 0 &&
                  doc.sliceString(insertPos - 1, insertPos).match(/\s/); // Match any whitespace

                if (isAtStart || isAfterSpace) {
                  slashTypedForMenu = true;
                }
              }
            }
          );
        }
      }

      if (slashTypedForMenu) {
        saveCursorPosition(); // Save position before opening menu
        setIsToolbarMenuOpen(true);
        setToolbarSearchTerm("");
        setToolbarSelectedItemIndex(-1);
        // Focus search input after a delay
        setTimeout(() => searchInputRef.current?.focus(), 10);
      }
    },
    [saveCursorPosition] // Depends on saveCursorPosition
  );

  /**
   * Stores the EditorView instance when CodeMirror is initialized.
   */
  const handleEditorMount = useCallback((view: EditorView) => {
    editorViewRef.current = view;
  }, []);

  // --- Menu Data Processing (Filtering & Grouping) ---

  const filteredContexts = useMemo(() => {
    const searchTermLower = toolbarSearchTerm.toLowerCase();
    if (!searchTermLower) {
      return contextOptions; // Return all if no search term
    }
    return contextOptions.filter((ctx) => {
      const name = getContextDisplayName(ctx);
      const keyPart = ctx.type === "key_value" ? ctx.key_value.key : name;
      return keyPart.toLowerCase().includes(searchTermLower);
    });
  }, [toolbarSearchTerm]);

  const groupedContexts = useMemo(() => {
    const groups: { [kind: string]: ContextReference[] } = {};
    filteredContexts.forEach((item) => {
      const kind = getContextKind(item); // Assumes getContextKind returns a stable string identifier
      groups[kind] = groups[kind] || [];
      groups[kind].push(item);
    });
    return groups;
  }, [filteredContexts]);

  const flattenedMenuItems = useMemo(() => {
    // Order by the keys of groupedContexts if a specific order is desired,
    // otherwise, Object.values provides an array of the groups.
    return Object.values(groupedContexts).flat();
  }, [groupedContexts]);

  // --- Keyboard Navigation & Effects ---

  /**
   * Scrolls the currently selected menu item into view if needed.
   */
  const scrollSelectedItemIntoView = useCallback((index: number) => {
    setTimeout(() => {
      const itemElement = document.getElementById(`context-item-${index}`);
      const container = menuItemsRef.current;
      if (itemElement && container) {
        const itemRect = itemElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          itemElement.scrollIntoView({ block: "nearest", inline: "nearest" });
        } else if (itemRect.top < containerRect.top) {
          itemElement.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
    }, 0); // Execute after potential DOM updates
  }, []); // No dependencies

  /**
   * Handles keyboard navigation (Arrows, Enter, Escape) within the toolbar context menu.
   */
  const handleToolbarMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const itemCount = flattenedMenuItems.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (itemCount > 0) {
          const nextIndex = (toolbarSelectedItemIndex + 1) % itemCount;
          setToolbarSelectedItemIndex(nextIndex);
          scrollSelectedItemIntoView(nextIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (itemCount > 0) {
          const nextIndex =
            (toolbarSelectedItemIndex - 1 + itemCount) % itemCount;
          setToolbarSelectedItemIndex(nextIndex);
          scrollSelectedItemIntoView(nextIndex);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (
          toolbarSelectedItemIndex >= 0 &&
          toolbarSelectedItemIndex < itemCount
        ) {
          handleSelectContextFromMenu(
            flattenedMenuItems[toolbarSelectedItemIndex]
          );
          // handleSelectContextFromMenu already handles focus return
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsToolbarMenuOpen(false);
        focusEditorAndRestoreCursor();
      }
    },
    [
      flattenedMenuItems,
      toolbarSelectedItemIndex,
      handleSelectContextFromMenu,
      scrollSelectedItemIntoView,
      focusEditorAndRestoreCursor,
    ]
  );

  // Effect for global Escape key listener to close menus/dropdowns
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isToolbarMenuOpen) {
          setIsToolbarMenuOpen(false);
          focusEditorAndRestoreCursor();
        } else if (activeDropdownContextId) {
          setActiveDropdownContextId(null);
          setCustomValueInput("");
          focusEditorAndRestoreCursor();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isToolbarMenuOpen, activeDropdownContextId, focusEditorAndRestoreCursor]);

  // Effect for handling clicks outside the toolbar menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isToolbarMenuOpen &&
        toolbarMenuRef.current &&
        !toolbarMenuRef.current.contains(event.target as Node) &&
        toolbarButtonRef.current &&
        !toolbarButtonRef.current.contains(event.target as Node)
      ) {
        // Check if the click was outside the editor as well, if needed
        // For now, assume clicking anywhere else closes the menu
        setIsToolbarMenuOpen(false);
        // Optionally restore focus, but maybe not on general clicks outside
        // focusEditorAndRestoreCursor();
      }
      // Similar logic could be added for the key-value dropdown if needed
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isToolbarMenuOpen /*, focusEditorAndRestoreCursor */]); // Add focus restore if needed on click outside

  // --- CodeMirror Extensions ---
  const editorExtensions = useMemo(() => {
    const themeConfig: Extension[] = [
      baseTheme,
      theme === "dark" ? darkThemeVars : lightThemeVars,
    ];

    return [
      keymap.of(defaultKeymap),
      EditorView.lineWrapping,
      EditorState.tabSize.of(4),
      EditorView.contentAttributes.of({ "aria-label": "Chat input" }),
      EditorView.updateListener.of((update) => {
        // If focus changes away from the editor, save cursor position
        if (!update.view.hasFocus && update.focusChanged) {
          // Potentially save cursor only if focus moves to expected elements (like menu)
          // saveCursorPosition();
        }
      }),
      ...themeConfig,
    ];
  }, [theme /*, saveCursorPosition */]); // Add saveCursorPosition if used in listener

  // --- Rendering ---

  /** Renders the context menu dropdown attached to the toolbar button */
  const renderToolbarContextMenu = () => (
    <div
      ref={toolbarMenuRef}
      className="absolute w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-20 overflow-hidden top-full left-0 mt-1"
      onKeyDown={handleToolbarMenuKeyDown} // Handle keys when menu itself is focused (e.g., via container)
    >
      <div className="p-0 border-b border-gray-200 dark:border-gray-800">
        <input
          ref={searchInputRef}
          type="text"
          className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 focus:outline-none"
          placeholder="Search context..."
          value={toolbarSearchTerm}
          onChange={handleToolbarSearchChange}
          onKeyDown={handleToolbarMenuKeyDown} // Handle keys directly on input
          aria-label="Search context items"
        />
      </div>

      <div className="max-h-52 overflow-y-auto" ref={menuItemsRef}>
        {flattenedMenuItems.length === 0 ? (
          <div className="py-2 px-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            No matches found
          </div>
        ) : (
          Object.entries(groupedContexts).map(([kind, items]) => (
            <div key={kind} className="py-0.5">
              <div className="px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                {
                  getContextSectionTitle(
                    items[0]
                  ) /* Assuming all items in group share title */
                }
              </div>
              {items.map((item) => {
                const flatIndex = flattenedMenuItems.findIndex(
                  (flatItem) => flatItem.id === item.id
                );
                const isSelected = flatIndex === toolbarSelectedItemIndex;
                const displayName = getContextDisplayName(item);
                const description = getContextDescription(item);

                return (
                  <button
                    id={`context-item-${flatIndex}`}
                    key={item.id} // Use stable ID
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full text-left px-2 py-1 text-xs ${
                      isSelected
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } focus:outline-none transition-colors flex flex-col`}
                    onClick={() => handleSelectContextFromMenu(item)}
                    onMouseEnter={() => setToolbarSelectedItemIndex(flatIndex)} // Update selection on hover
                  >
                    <span className="font-medium truncate">{displayName}</span>
                    {description && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );

  /** Renders the dropdown menu for a key-value context item */
  const renderKeyValueDropdown = (context: KeyValueContextElement) => {
    const allowCustomValue = context.key_value.customValue === true;
    return (
      <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-20">
        <div className="py-1" role="listbox">
          {context.key_value.options?.map((option) => (
            <button
              key={option}
              role="option"
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleSelectOption(context, option)}
            >
              {option}
            </button>
          ))}
          {allowCustomValue && (
            <div className="px-2 py-1 border-t border-gray-200 dark:border-gray-700">
              <input
                ref={customInputRef}
                type="text"
                className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-700 rounded"
                placeholder="Custom value..."
                value={customValueInput}
                onChange={(e) => setCustomValueInput(e.target.value)}
                onKeyDown={(e) => handleCustomInputKeyDown(e, context)}
                onClick={(e) => e.stopPropagation()} // Prevent closing dropdown
                aria-label="Enter custom value"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-4 bg-transparent">
      {/* --- Toolbar and Selected Contexts --- */}
      <div className="mb-1 flex flex-col">
        <div className="flex items-center flex-wrap gap-1.5">
          {" "}
          {/* Use gap for spacing */}
          {/* Toolbar Context Button */}
          <div className="relative">
            <button
              ref={toolbarButtonRef}
              onClick={handleToggleToolbarMenu}
              className="flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
              aria-haspopup="true"
              aria-expanded={isToolbarMenuOpen}
              aria-label="Add context"
              title="Add context"
            >
              @
            </button>
            {isToolbarMenuOpen && renderToolbarContextMenu()}
          </div>
          {/* Selected Context Pills */}
          {selectedContexts.map((context) => {
            const isKeyValue = context.type === "key_value";
            const keyValueContext = isKeyValue
              ? (context as KeyValueContextElement)
              : null;
            const hasOptions = !!keyValueContext?.key_value.options?.length;
            const isDropdownOpen = activeDropdownContextId === context.id;
            const displayName = getContextDisplayName(context);

            return (
              <div key={context.id} className="relative">
                <div
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded
                    ${hasOptions ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" : ""}
                    bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200`}
                  onClick={
                    hasOptions ? () => toggleDropdown(context.id) : undefined
                  }
                  role={hasOptions ? "button" : undefined}
                  aria-haspopup={hasOptions ? "listbox" : undefined}
                  aria-expanded={hasOptions ? isDropdownOpen : undefined}
                >
                  <span className="truncate max-w-[100px]">{displayName}</span>
                  {hasOptions && (
                    <span
                      className={`ml-0.5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "transform rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dropdown toggle if applicable
                      removeContext(context.id);
                    }}
                    className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 leading-none flex items-center justify-center w-3 h-3" // Ensure button is easily clickable
                    aria-label={`Remove ${displayName} context`}
                  >
                    ×
                  </button>
                </div>

                {/* Render dropdown if open */}
                {hasOptions &&
                  isDropdownOpen &&
                  keyValueContext &&
                  renderKeyValueDropdown(keyValueContext)}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- CodeMirror Editor --- */}
      <div className="relative">
        {" "}
        {/* Removed editorRef here, not needed */}
        <CodeMirror
          value={value}
          height="auto"
          minHeight="16rem" // Consider making these props if they vary
          maxHeight="200px"
          extensions={editorExtensions}
          onChange={onEditorChange}
          onCreateEditor={handleEditorMount} // Use this to get the view instance
          style={{ width: "100%" }}
          theme="none" // Using custom theme extensions
        />
      </div>

      {/* --- Help Text --- */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Use the @ button or type / to add context.
      </div>
    </div>
  );
};

export default ChatInput;