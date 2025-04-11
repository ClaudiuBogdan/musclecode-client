import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  contextOptions,
  getContextDisplayName,
  getContextDescription,
  getContextKind,
  getContextSectionTitle,
  updateKeyValueContextValue,
  shouldReplaceContext,
} from "./types";
import { ContextReference, KeyValueContextElement } from "../types";

export interface ContextSelectorProps {
  /** Currently selected contexts */
  selectedContexts: ContextReference[];
  /** Called when selected contexts change */
  onContextsChange: (contexts: ContextReference[]) => void;
  /** Whether the menu is currently open */
  isMenuOpen: boolean;
  /** Called when the menu should be opened/closed */
  onMenuOpenChange: (isOpen: boolean) => void;
  /** Saving cursor position for restoring focus */
  onSaveCursorPosition: () => void;
  /** Function to restore focus to editor */
  onFocusEditor: () => void;
}

/**
 * ContextSelector component for selecting context elements in the chat input
 */
export const ContextSelector: React.FC<ContextSelectorProps> = ({
  selectedContexts,
  onContextsChange,
  isMenuOpen,
  onMenuOpenChange,
  onSaveCursorPosition,
  onFocusEditor,
}) => {
  // --- Local State ---
  const [toolbarSearchTerm, setToolbarSearchTerm] = useState("");
  const [toolbarSelectedItemIndex, setToolbarSelectedItemIndex] = useState(-1);
  const [activeDropdownContextId, setActiveDropdownContextId] = useState<
    string | null
  >(null);
  const [customValueInput, setCustomValueInput] = useState<string>("");

  // --- Refs ---
  const toolbarMenuRef = useRef<HTMLDivElement>(null);
  const toolbarButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // --- Hotkeys ---
  // Add Command+Slash hotkey to open context menu
  useHotkeys(
    "meta+/",
    (e) => {
      e.preventDefault();
      // Save cursor position before opening the menu
      onSaveCursorPosition();
      onMenuOpenChange(true);
      // Focus search input after a delay
      setTimeout(() => searchInputRef.current?.focus(), 10);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
    },
    [onSaveCursorPosition, onMenuOpenChange]
  );

  // --- Context Management ---

  /**
   * Adds a new context item or replaces an existing one based on replacement rules.
   */
  const addContext = useCallback(
    (contextToAdd: ContextReference) => {
      const newContexts = [...selectedContexts];
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

      onContextsChange(newContexts);
      onMenuOpenChange(false); // Close menu after adding
    },
    [selectedContexts, onContextsChange, onMenuOpenChange]
  );

  /**
   * Removes a context item by its ID.
   */
  const removeContext = useCallback(
    (contextId: string) => {
      onContextsChange(selectedContexts.filter((ctx) => ctx.id !== contextId));
    },
    [selectedContexts, onContextsChange]
  );

  /**
   * Updates a KeyValueContextElement with a new value.
   */
  const updateKeyValueContext = useCallback(
    (context: KeyValueContextElement, newValue: string) => {
      const updatedContext = updateKeyValueContextValue(context, newValue);
      onContextsChange(
        selectedContexts.map((ctx) =>
          ctx.id === context.id ? updatedContext : ctx
        )
      );

      // Close dropdown and reset input
      setActiveDropdownContextId(null);
      setCustomValueInput("");

      // Return focus to the editor
      onFocusEditor();
    },
    [selectedContexts, onContextsChange, onFocusEditor]
  );

  // --- Key-Value Context Dropdown Handlers ---

  const toggleDropdown = useCallback(
    (contextId: string) => {
      setActiveDropdownContextId((prev) =>
        prev === contextId ? null : contextId
      );
      setCustomValueInput(""); // Reset custom input when toggling

      // Save cursor position when opening a dropdown
      if (activeDropdownContextId !== contextId) {
        onSaveCursorPosition();
      }
    },
    [activeDropdownContextId, onSaveCursorPosition]
  );

  const handleSelectOption = useCallback(
    (context: KeyValueContextElement, option: string) => {
      updateKeyValueContext(context, option);
    },
    [updateKeyValueContext]
  );

  const handleCustomValueSubmit = useCallback(
    (context: KeyValueContextElement) => {
      if (customValueInput.trim()) {
        updateKeyValueContext(context, customValueInput.trim());
      }
    },
    [customValueInput, updateKeyValueContext]
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
        onFocusEditor(); // Return focus on Escape
      }
    },
    [handleCustomValueSubmit, onFocusEditor]
  );

  // --- Toolbar Context Menu Handlers ---

  const handleToggleToolbarMenu = useCallback(() => {
    // Save cursor position before opening the menu
    if (!isMenuOpen) {
      onSaveCursorPosition();
    }

    onMenuOpenChange(!isMenuOpen);
    setToolbarSearchTerm(""); // Reset search on toggle
    setToolbarSelectedItemIndex(-1); // Reset selection on toggle

    // Focus search input when opening
    if (!isMenuOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 10);
    } else {
      // If closing manually, return focus to editor
      onFocusEditor();
    }
  }, [isMenuOpen, onSaveCursorPosition, onMenuOpenChange, onFocusEditor]);

  const handleSelectContextFromMenu = useCallback(
    (context: ContextReference) => {
      addContext(context); // Add the context
      onFocusEditor(); // Return focus to editor
    },
    [addContext, onFocusEditor]
  );

  const handleToolbarSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setToolbarSearchTerm(e.target.value);
      setToolbarSelectedItemIndex(-1); // Reset selection when search term changes
    },
    []
  );

  // --- Menu Data Processing ---

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
      const kind = getContextKind(item);
      groups[kind] = groups[kind] || [];
      groups[kind].push(item);
    });
    return groups;
  }, [filteredContexts]);

  const flattenedMenuItems = useMemo(() => {
    return Object.values(groupedContexts).flat();
  }, [groupedContexts]);

  // --- Keyboard Navigation ---

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
    }, 0);
  }, []);

  /**
   * Handles keyboard navigation within the toolbar context menu.
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
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onMenuOpenChange(false);
        onFocusEditor();
      }
    },
    [
      flattenedMenuItems,
      toolbarSelectedItemIndex,
      handleSelectContextFromMenu,
      scrollSelectedItemIntoView,
      onMenuOpenChange,
      onFocusEditor,
    ]
  );

  // --- Effects ---

  // Effect for global Escape key listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isMenuOpen) {
          onMenuOpenChange(false);
          onFocusEditor();
        } else if (activeDropdownContextId) {
          setActiveDropdownContextId(null);
          setCustomValueInput("");
          onFocusEditor();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isMenuOpen, activeDropdownContextId, onMenuOpenChange, onFocusEditor]);

  // Effect for handling clicks outside the toolbar menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        toolbarMenuRef.current &&
        !toolbarMenuRef.current.contains(event.target as Node) &&
        toolbarButtonRef.current &&
        !toolbarButtonRef.current.contains(event.target as Node)
      ) {
        onMenuOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, onMenuOpenChange]);

  // --- Rendering ---

  /** Renders the context menu dropdown attached to the toolbar button */
  const renderToolbarContextMenu = () => (
    <div
      ref={toolbarMenuRef}
      className="absolute w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-20 overflow-hidden top-full left-0 mt-1"
      onKeyDown={handleToolbarMenuKeyDown}
    >
      <div className="p-0 border-b border-gray-200 dark:border-gray-800">
        <input
          ref={searchInputRef}
          type="text"
          className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 focus:outline-none"
          placeholder="Search context..."
          value={toolbarSearchTerm}
          onChange={handleToolbarSearchChange}
          onKeyDown={handleToolbarMenuKeyDown}
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
                {getContextSectionTitle(items[0])}
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
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full text-left px-2 py-1 text-xs ${
                      isSelected
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } focus:outline-none transition-colors flex flex-col`}
                    onClick={() => handleSelectContextFromMenu(item)}
                    onMouseEnter={() => setToolbarSelectedItemIndex(flatIndex)}
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
                onClick={(e) => e.stopPropagation()}
                aria-label="Enter custom value"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-1 flex flex-col">
      <div className="flex items-center flex-wrap gap-1.5">
        {/* Toolbar Context Button */}
        <div className="relative">
          <button
            ref={toolbarButtonRef}
            onClick={handleToggleToolbarMenu}
            className="flex items-center justify-center p-2 h-6 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-label="Add context"
            title="Add context"
          >
            Context ⌘ + /
          </button>
          {isMenuOpen && renderToolbarContextMenu()}
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
                    e.stopPropagation();
                    removeContext(context.id);
                  }}
                  className="ml-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 leading-none flex items-center justify-center w-3 h-3"
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
  );
};

export default ContextSelector;
