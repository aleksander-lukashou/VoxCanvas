document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');
	
	// You could initialize your WebRTC connection here if needed
	
	// Create a MutationObserver to watch for added style tags
	const observer = new MutationObserver((mutations) => {
		// Process each mutation
		mutations.forEach(mutation => {
			// Check for added nodes
			mutation.addedNodes.forEach(node => {
				// If it's a style tag, process it immediately
				if (node.nodeName === 'STYLE') {
					// Process this specific style tag
					const styleContent = node.textContent || '';
					
					// Parse the style tag to extract ID and style properties
					const styleRegex = /#([a-zA-Z0-9-_]+)\s*{([^}]*)}/g;
					let match;
					
					while ((match = styleRegex.exec(styleContent)) !== null) {
						const targetId = match[1];
						const styleText = match[2];
						const element = document.getElementById(targetId);
						
						if (element) {
							// Apply styles directly to the element instead of using a style tag
							styleText.split(';').forEach(prop => {
								const [key, value] = prop.split(':').map(s => s.trim());
								if (key && value) {
									// Apply each style property directly to the element's style
									element.style[key] = value;
								}
							});
						}
					}
					
					// Remove the style element as we've processed it
					node.remove();
				}
				
				// Also check for nodes that might contain style tags
				if (node.nodeType === Node.ELEMENT_NODE) {
					const styleElements = node.querySelectorAll('style');
					if (styleElements.length > 0) {
						// Process these style tags
						processStyleTags();
					}
				}
			});
		});
	});
	
	// Start observing the document with the configured parameters
	observer.observe(document.body, { 
		childList: true,   // Watch for changes to child nodes
		subtree: true,     // Watch the entire subtree
		attributes: false, // No need to watch attributes
		characterData: false // No need to watch text content changes
	});
});

const fns = {
	getPageHTML: () => {
		return { success: true, html: document.documentElement.outerHTML };
	},
	changeBackgroundColor: ({ color }) => {
		document.body.style.backgroundColor = color;
		return { success: true, color };
	},
	changeTextColor: ({ color }) => {
		document.body.style.color = color;
		return { success: true, color };
	},
	// New functions
	addText: ({ text, elementId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		const paragraph = document.createElement('p');
		paragraph.textContent = text;
		
		// Ensure the element has an ID
		const paragraphId = generateUniqueId('text');
		paragraph.id = paragraphId;
		
		targetElement.appendChild(paragraph);
		return { success: true, text, elementId, createdElementId: paragraphId };
	},
	addButton: ({ text, elementId, buttonId, className }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		const button = document.createElement('button');
		button.textContent = text;
		
		// Ensure the button has an ID
		const actualButtonId = buttonId || generateUniqueId('button');
		button.id = actualButtonId;
		
		if (className) button.className = className;
		targetElement.appendChild(button);
		return { success: true, buttonId: actualButtonId };
	},
	addInputField: ({ placeholder, type, elementId, inputId, className }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		const input = document.createElement('input');
		input.type = type || 'text';
		if (placeholder) input.placeholder = placeholder;
		
		// Ensure the input has an ID
		const actualInputId = inputId || generateUniqueId('input');
		input.id = actualInputId;
		
		if (className) input.className = className;
		targetElement.appendChild(input);
		return { success: true, inputId: actualInputId };
	},
	addDropdownMenu: ({ options, elementId, selectId, className }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		// Create a select element
		const select = document.createElement('select');
		
		// Ensure the select has an ID
		const actualSelectId = selectId || generateUniqueId('select');
		select.id = actualSelectId;
		
		if (className) select.className = className;
		
		// Add options to the select element
		options.forEach(option => {
			const optElement = document.createElement('option');
			optElement.value = option.value;
			optElement.textContent = option.text;
			select.appendChild(optElement);
		});
		
		// Append the select element to the target
		targetElement.appendChild(select);
		
		return { success: true, selectId: actualSelectId };
	},
	changeElementOrder: ({ elementIds }) => {
		const parent = document.querySelector('.content');
		if (!parent) {
			return { success: false, error: 'Content container not found' };
		}
		
		const elements = [];
		let missingElements = [];
		
		// Collect all elements and check if they exist
		elementIds.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				elements.push(element);
			} else {
				missingElements.push(id);
			}
		});
		
		if (missingElements.length > 0) {
			return { success: false, error: `Elements not found: ${missingElements.join(', ')}` };
		}
		
		// Remove elements from DOM temporarily
		elements.forEach(el => el.remove());
		
		// Add them back in the specified order
		elements.forEach(el => parent.appendChild(el));
		
		return { success: true, newOrder: elementIds };
	},
	changeTextStyle: ({ elementId, styles }) => {
		const element = elementId ? document.getElementById(elementId) : null;
		if (!element) {
			return { success: false, error: 'Element not found' };
		}
		
		// Apply the styles directly to the element's style property
		if (styles.fontSize) element.style.fontSize = styles.fontSize;
		if (styles.fontWeight) element.style.fontWeight = styles.fontWeight;
		if (styles.textAlign) element.style.textAlign = styles.textAlign;
		if (styles.fontFamily) element.style.fontFamily = styles.fontFamily;
		if (styles.fontStyle) element.style.fontStyle = styles.fontStyle;
		if (styles.textDecoration) element.style.textDecoration = styles.textDecoration;
		if (styles.lineHeight) element.style.lineHeight = styles.lineHeight;
		if (styles.letterSpacing) element.style.letterSpacing = styles.letterSpacing;
		if (styles.color) element.style.color = styles.color;
		if (styles.backgroundColor) element.style.backgroundColor = styles.backgroundColor;
		
		// Handle any additional properties that weren't explicitly listed
		Object.keys(styles).forEach(key => {
			// Skip the ones we've already handled
			if (!['fontSize', 'fontWeight', 'textAlign', 'fontFamily', 'fontStyle', 
				  'textDecoration', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor'].includes(key)) {
				element.style[key] = styles[key];
			}
		});
		
		return { success: true, elementId, appliedStyles: styles };
	},
	// Add new positioning functions
	insertElementBefore: ({ newElement, targetId }) => {
		const targetElement = document.getElementById(targetId);
		if (!targetElement) {
			return { success: false, error: `Target element with ID ${targetId} not found` };
		}
		
		let elementToInsert;
		
		// Create the element based on the type
		if (newElement.type === 'text') {
			elementToInsert = document.createElement('p');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'button') {
			elementToInsert = document.createElement('button');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'input') {
			elementToInsert = document.createElement('input');
			elementToInsert.type = newElement.inputType || 'text';
			elementToInsert.placeholder = newElement.placeholder || '';
		} else {
			return { success: false, error: 'Unsupported element type' };
		}
		
		// Ensure the element has an ID
		const elementId = newElement.id || generateUniqueId(newElement.type);
		elementToInsert.id = elementId;
		
		if (newElement.className) elementToInsert.className = newElement.className;
		
		// Insert before the target
		targetElement.parentNode.insertBefore(elementToInsert, targetElement);
		
		return { success: true, insertedElementId: elementId };
	},
	
	insertElementAfter: ({ newElement, targetId }) => {
		const targetElement = document.getElementById(targetId);
		if (!targetElement) {
			return { success: false, error: `Target element with ID ${targetId} not found` };
		}
		
		let elementToInsert;
		
		// Create the element based on the type
		if (newElement.type === 'text') {
			elementToInsert = document.createElement('p');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'button') {
			elementToInsert = document.createElement('button');
			elementToInsert.textContent = newElement.content;
		} else if (newElement.type === 'input') {
			elementToInsert = document.createElement('input');
			elementToInsert.type = newElement.inputType || 'text';
			elementToInsert.placeholder = newElement.placeholder || '';
		} else {
			return { success: false, error: 'Unsupported element type' };
		}
		
		// Ensure the element has an ID
		const elementId = newElement.id || generateUniqueId(newElement.type);
		elementToInsert.id = elementId;
		
		if (newElement.className) elementToInsert.className = newElement.className;
		
		// Insert after the target
		targetElement.parentNode.insertBefore(elementToInsert, targetElement.nextSibling);
		
		return { success: true, insertedElementId: elementId };
	},
	
	moveElement: ({ elementId, targetId, position }) => {
		const element = document.getElementById(elementId);
		const targetElement = document.getElementById(targetId);
		
		if (!element) {
			return { success: false, error: `Element with ID ${elementId} not found` };
		}
		
		if (!targetElement) {
			return { success: false, error: `Target element with ID ${targetId} not found` };
		}
		
		// Remove the element from its current position
		element.remove();
		
		// Insert at the specified position relative to the target
		if (position === 'before') {
			targetElement.parentNode.insertBefore(element, targetElement);
		} else if (position === 'after') {
			targetElement.parentNode.insertBefore(element, targetElement.nextSibling);
		} else if (position === 'prepend') {
			// Insert as first child of target
			targetElement.prepend(element);
		} else if (position === 'append') {
			// Insert as last child of target
			targetElement.appendChild(element);
		} else {
			return { success: false, error: 'Invalid position. Use "before", "after", "prepend", or "append"' };
		}
		
		return { success: true, movedElementId: elementId, position };
	},
	
	deleteElement: ({ elementId }) => {
		const element = document.getElementById(elementId);
		if (!element) {
			return { success: false, error: `Element with ID ${elementId} not found` };
		}
		
		// Remove the element from the DOM
		element.remove();
		
		return { success: true, deletedElementId: elementId };
	},
	
	listPageElements: () => {
		// Get all elements with IDs
		const elementsWithIds = document.querySelectorAll('[id]');
		const elementsList = [];
		
		// Create a list of all elements with their IDs
		elementsWithIds.forEach(el => {
			elementsList.push({
				id: el.id,
				tagName: el.tagName.toLowerCase(),
				text: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : ''),
				visible: el.offsetParent !== null
			});
		});
		
		return { 
			success: true, 
			elements: elementsList,
			count: elementsList.length
		};
	},
	getElementInfo: ({ elementId }) => {
		const element = document.getElementById(elementId);
		
		if (!element) {
			// Try a case-insensitive search as a fallback
			const allElements = document.querySelectorAll('[id]');
			let foundElement = null;
			
			allElements.forEach(el => {
				if (el.id.toLowerCase() === elementId.toLowerCase()) {
					foundElement = el;
				}
			});
			
			if (foundElement) {
				return { 
					success: true, 
					found: true,
					exactMatch: false,
					element: {
						id: foundElement.id,
						tagName: foundElement.tagName.toLowerCase(),
						text: foundElement.textContent.substring(0, 50) + (foundElement.textContent.length > 50 ? '...' : '')
					}
				};
			}
			
			return { success: false, found: false, error: `Element with ID ${elementId} not found` };
		}
		
		return { 
			success: true, 
			found: true,
			exactMatch: true,
			element: {
				id: element.id,
				tagName: element.tagName.toLowerCase(),
				text: element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : '')
			}
		};
	},
	// Add a new function to handle inline text formatting (like bold, italic, etc.)
	formatTextContent: ({ elementId, format, selection }) => {
		const element = elementId ? document.getElementById(elementId) : null;
		if (!element) {
			return { success: false, error: 'Element not found' };
		}
		
		// Handle styles that apply to the entire element
		if (format === 'align-left' || format === 'align-center' || format === 'align-right' || format === 'align-justify') {
			// For alignment, apply to the whole element
			const alignment = format.replace('align-', '');
			element.style.textAlign = alignment;
			return { success: true, elementId, format };
		}
		
		// Handle specific color or font-size for the entire element
		if (format.startsWith('color-') || format.startsWith('size-')) {
			if (format.startsWith('color-')) {
				const color = format.replace('color-', '');
				element.style.color = color;
			} else if (format.startsWith('size-')) {
				const size = format.replace('size-', '');
				element.style.fontSize = size;
			}
			return { success: true, elementId, format };
		}
		
		// Get the current content of the element
		let content = element.textContent || '';
		
		// If a specific selection was provided, apply formatting to that portion only
		if (selection && selection.start >= 0 && selection.end <= content.length && selection.start < selection.end) {
			const beforeSelection = content.substring(0, selection.start);
			const selectedText = content.substring(selection.start, selection.end);
			const afterSelection = content.substring(selection.end);
			
			// Apply the requested formatting
			let formattedText = selectedText;
			switch (format) {
				case 'bold':
					formattedText = `<strong>${selectedText}</strong>`;
					break;
				case 'italic':
					formattedText = `<em>${selectedText}</em>`;
					break;
				case 'underline':
					formattedText = `<u>${selectedText}</u>`;
					break;
				default:
					return { success: false, error: 'Unsupported format type for selection' };
			}
			
			// Update the element's content with the formatted text
			element.innerHTML = beforeSelection + formattedText + afterSelection;
			return { success: true, elementId, format };
		}
		
		return { success: false, error: 'Invalid selection range or unsupported format' };
	},
	// New responsive layout functions
	createLayoutContainer: ({ containerId, type, elementId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		// Create container element
		const container = document.createElement('div');
		
		// Ensure the container has an ID
		const actualContainerId = containerId || generateUniqueId('layout');
		container.id = actualContainerId;
		
		// Set layout type
		container.style.display = type === 'grid' ? 'grid' : 'flex';
		
		// Set additional basic styles
		if (type === 'flex') {
			container.style.flexWrap = 'wrap';
			container.style.width = '100%';
		} else if (type === 'grid') {
			container.style.width = '100%';
		}
		
		// Add container to the target element
		targetElement.appendChild(container);
		
		return { 
			success: true, 
			containerId: actualContainerId, 
			type
		};
	},
	
	createColumnLayout: ({ containerId, columns, gap, breakpoints }) => {
		const container = document.getElementById(containerId);
		if (!container) {
			return { success: false, error: `Container with ID ${containerId} not found` };
		}
		
		// Set up flex container
		container.style.display = 'flex';
		container.style.flexWrap = 'wrap';
		container.style.gap = gap || '20px';
		container.style.width = '100%';
		
		// Define number of columns and their widths
		const numColumns = parseInt(columns) || 3;
		
		// Create a unique class name for this layout's columns
		const columnClassName = `column-${containerId}`;
		
		// Create a style element for the column styles
		const styleElement = document.createElement('style');
		
		let columnCss = `.${columnClassName} {
			flex: 1 1 calc((100% - ${(numColumns-1) * (parseInt(gap) || 20)}px) / ${numColumns});
		}`;
		
		// Add responsive breakpoints
		if (breakpoints && Array.isArray(breakpoints)) {
			breakpoints.forEach(bp => {
				if (bp.maxWidth && bp.columns) {
					const colWidth = bp.columns === 1 ? '100%' : 
						`calc((100% - ${(bp.columns-1) * (parseInt(gap) || 20)}px) / ${bp.columns})`;
					
					columnCss += `
					@media (max-width: ${bp.maxWidth}) {
						.${columnClassName} {
							flex: 1 1 ${colWidth};
						}
					}`;
				}
			});
		}
		
		styleElement.textContent = columnCss;
		document.head.appendChild(styleElement);
		
		// Store metadata for this layout
		container.dataset.layoutType = 'columns';
		container.dataset.columnClass = columnClassName;
		
		return { 
			success: true, 
			containerId,
			columnClassName,
			numberOfColumns: numColumns
		};
	},
	
	createGridLayout: ({ containerId, rows, columns, areas, gap }) => {
		const container = document.getElementById(containerId);
		if (!container) {
			return { success: false, error: `Container with ID ${containerId} not found` };
		}
		
		// Set up grid container
		container.style.display = 'grid';
		
		// Set gap
		if (gap) {
			container.style.gap = gap;
		}
		
		// Setup grid template columns
		if (columns) {
			if (typeof columns === 'number' || !isNaN(parseInt(columns))) {
				// Equal columns
				container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
			} else if (Array.isArray(columns)) {
				// Custom column widths
				container.style.gridTemplateColumns = columns.join(' ');
			} else {
				// Direct string value
				container.style.gridTemplateColumns = columns;
			}
		}
		
		// Setup grid template rows
		if (rows) {
			if (typeof rows === 'number' || !isNaN(parseInt(rows))) {
				// Equal rows
				container.style.gridTemplateRows = `repeat(${rows}, auto)`;
			} else if (Array.isArray(rows)) {
				// Custom row heights
				container.style.gridTemplateRows = rows.join(' ');
			} else {
				// Direct string value
				container.style.gridTemplateRows = rows;
			}
		}
		
		// Setup named grid areas
		if (areas && Array.isArray(areas)) {
			container.style.gridTemplateAreas = areas
				.map(row => `"${row}"`)
				.join(' ');
		}
		
		// Store metadata
		container.dataset.layoutType = 'grid';
		
		return { 
			success: true, 
			containerId,
			gridColumns: columns,
			gridRows: rows,
			gridAreas: areas
		};
	},
	
	addElementToLayout: ({ element, containerId, position }) => {
		const container = document.getElementById(containerId);
		if (!container) {
			return { success: false, error: `Container with ID ${containerId} not found` };
		}
		
		// Create the element based on the type
		let newElement;
		if (element.type === 'text') {
			newElement = document.createElement('p');
			newElement.textContent = element.content;
		} else if (element.type === 'div') {
			newElement = document.createElement('div');
			if (element.content) newElement.textContent = element.content;
		} else if (element.type === 'heading') {
			const level = element.level || 2;
			newElement = document.createElement(`h${level}`);
			newElement.textContent = element.content;
		} else if (element.type === 'button') {
			newElement = document.createElement('button');
			newElement.textContent = element.content;
		} else if (element.type === 'image') {
			newElement = document.createElement('img');
			newElement.src = element.src;
			newElement.alt = element.alt || '';
		} else if (element.type === 'custom') {
			newElement = document.createElement(element.tagName || 'div');
			if (element.content) {
				newElement.innerHTML = element.content;
			}
		} else {
			// Default to div
			newElement = document.createElement('div');
		}
		
		// Ensure the element has an ID
		const elementId = element.id || generateUniqueId(element.type);
		newElement.id = elementId;
		
		// Add classes if provided
		if (element.className) {
			newElement.className = element.className;
		}
		
		// Add layout-specific class if it's a column layout
		if (container.dataset.layoutType === 'columns' && container.dataset.columnClass) {
			newElement.classList.add(container.dataset.columnClass);
		}
		
		// Position the element in the layout
		if (position) {
			if (container.dataset.layoutType === 'grid') {
				// Grid positioning
				if (position.row) {
					newElement.style.gridRow = position.row;
				}
				if (position.column) {
					newElement.style.gridColumn = position.column;
				}
				if (position.area) {
					newElement.style.gridArea = position.area;
				}
			} else {
				// Flex positioning
				if (position.order) {
					newElement.style.order = position.order;
				}
				if (position.grow) {
					newElement.style.flexGrow = position.grow;
				}
				if (position.shrink) {
					newElement.style.flexShrink = position.shrink;
				}
				if (position.basis) {
					newElement.style.flexBasis = position.basis;
				}
			}
		}
		
		// Add styles if provided
		if (element.styles && typeof element.styles === 'object') {
			Object.keys(element.styles).forEach(key => {
				newElement.style[key] = element.styles[key];
			});
		}
		
		// Add the element to the container
		container.appendChild(newElement);
		
		return { 
			success: true, 
			elementId,
			containerId
		};
	},
	
	setResponsiveRules: ({ elementId, rules }) => {
		const element = document.getElementById(elementId);
		if (!element) {
			return { success: false, error: `Element with ID ${elementId} not found` };
		}
		
		if (!rules || !Array.isArray(rules) || rules.length === 0) {
			return { success: false, error: 'No valid responsive rules provided' };
		}
		
		// Create a unique ID for the style element
		const styleId = `responsive-${elementId}-${Date.now()}`;
		
		// Create a style element for responsive rules
		const styleElement = document.createElement('style');
		styleElement.id = styleId;
		
		let cssRules = '';
		
		// Process each responsive rule
		rules.forEach((rule, index) => {
			let mediaQuery = '';
			
			// Create the media query
			if (rule.maxWidth) {
				mediaQuery = `@media (max-width: ${rule.maxWidth})`;
			} else if (rule.minWidth) {
				mediaQuery = `@media (min-width: ${rule.minWidth})`;
			} else if (rule.media) {
				mediaQuery = `@media ${rule.media}`;
			}
			
			if (!mediaQuery) {
				return; // Skip invalid rules
			}
			
			// Create CSS for this rule
			let cssProperties = '';
			if (rule.styles && typeof rule.styles === 'object') {
				Object.keys(rule.styles).forEach(key => {
					// Convert camelCase to kebab-case for CSS properties
					const property = key.replace(/([A-Z])/g, '-$1').toLowerCase();
					cssProperties += `${property}: ${rule.styles[key]}; `;
				});
			}
			
			if (cssProperties) {
				cssRules += `
				${mediaQuery} {
					#${elementId} {
						${cssProperties}
					}
				}`;
			}
		});
		
		styleElement.textContent = cssRules;
		document.head.appendChild(styleElement);
		
		// Store the style element ID for potential future updates
		element.dataset.responsiveStyleId = styleId;
		
		return { 
			success: true, 
			elementId,
			styleId,
			rulesApplied: rules.length
		};
	},
	
	// Image generation function
	generateImage: async ({ prompt, size, quality, style, elementId }) => {
		try {
			// Create a loading placeholder
			const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
			if (!targetElement) {
				return { success: false, error: 'Target element not found' };
			}
			
			// Create image container with loading indicator
			const imageContainer = document.createElement('div');
			const containerId = generateUniqueId('img-container');
			imageContainer.id = containerId;
			imageContainer.style.position = 'relative';
			imageContainer.style.minHeight = '200px';
			imageContainer.style.display = 'flex';
			imageContainer.style.justifyContent = 'center';
			imageContainer.style.alignItems = 'center';
			imageContainer.textContent = 'Generating image...';
			
			targetElement.appendChild(imageContainer);
			
			// Make API request to generate image
			const response = await fetch('/api/generate-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt,
					size: size || '1024x1024', // Default size
					quality: quality || 'standard', // 'standard' or 'hd'
					style: style || 'vivid', // 'vivid' or 'natural'
				}),
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				imageContainer.textContent = 'Image generation failed';
				return { 
					success: false, 
					error: errorData.error || 'Failed to generate image',
					containerId 
				};
			}
			
			const data = await response.json();
			
			// Create and display the generated image
			imageContainer.textContent = '';
			const img = document.createElement('img');
			img.src = data.url;
			img.alt = prompt;
			img.style.maxWidth = '100%';
			img.style.height = 'auto';
			img.id = generateUniqueId('generated-img');
			
			imageContainer.appendChild(img);
			
			return { 
				success: true, 
				imageUrl: data.url, 
				containerId,
				imageId: img.id 
			};
		} catch (error) {
			console.error('Image generation error:', error);
			return { 
				success: false, 
				error: error.message || 'An error occurred during image generation' 
			};
		}
	},
	
	// Simplified image placeholder (when generation is not available)
	createImagePlaceholder: ({ text, width, height, elementId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		const placeholderContainer = document.createElement('div');
		const containerId = generateUniqueId('img-placeholder');
		placeholderContainer.id = containerId;
		
		placeholderContainer.style.width = width || '300px';
		placeholderContainer.style.height = height || '200px';
		placeholderContainer.style.backgroundColor = '#f0f0f0';
		placeholderContainer.style.display = 'flex';
		placeholderContainer.style.justifyContent = 'center';
		placeholderContainer.style.alignItems = 'center';
		placeholderContainer.style.border = '1px solid #ddd';
		placeholderContainer.style.fontSize = '1rem';
		
		placeholderContainer.textContent = text || 'Image';
		
		targetElement.appendChild(placeholderContainer);
		
		return { 
			success: true, 
			containerId,
			width: width || '300px',
			height: height || '200px'
		};
	},
};

// Create a WebRTC Agent
const peerConnection = new RTCPeerConnection();

// On inbound audio add to page
peerConnection.ontrack = (event) => {
	const el = document.createElement('audio');
	el.srcObject = event.streams[0];
	el.autoplay = el.controls = true;
	document.body.appendChild(el);
};

const dataChannel = peerConnection.createDataChannel('oai-events');

function configureData() {
	console.log('Configuring data channel');
	const event = {
		type: 'session.update',
		session: {
			modalities: ['text', 'audio'],
			// Provide the tools. Note they match the keys in the `fns` object above
			tools: [
				{
					type: 'function',
					name: 'changeBackgroundColor',
					description: 'Changes the background color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value of the color' },
						},
					},
				},
				{
					type: 'function',
					name: 'changeTextColor',
					description: 'Changes the text color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value of the color' },
						},
					},
				},
				{
					type: 'function',
					name: 'getPageHTML',
					description: 'Gets the HTML for the current page',
				},
				// New tool definitions
				{
					type: 'function',
					name: 'addText',
					description: 'Adds a new text paragraph to the page',
					parameters: {
						type: 'object',
						properties: {
							text: { type: 'string', description: 'The text content to add' },
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
						},
						required: ['text']
					},
				},
				{
					type: 'function',
					name: 'addButton',
					description: 'Adds a new button to the page',
					parameters: {
						type: 'object',
						properties: {
							text: { type: 'string', description: 'The button text' },
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
							buttonId: { type: 'string', description: 'Optional ID for the button' },
							className: { type: 'string', description: 'Optional CSS class for the button' },
						},
						required: ['text']
					},
				},
				{
					type: 'function',
					name: 'addInputField',
					description: 'Adds a new input field to the page',
					parameters: {
						type: 'object',
						properties: {
							placeholder: { type: 'string', description: 'Placeholder text for the input' },
							type: { type: 'string', description: 'Input type (text, number, email, etc.)' },
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
							inputId: { type: 'string', description: 'Optional ID for the input' },
							className: { type: 'string', description: 'Optional CSS class for the input' },
						}
					},
				},
				{
					type: 'function',
					name: 'addDropdownMenu',
					description: 'Adds a dropdown menu to the page',
					parameters: {
						type: 'object',
						properties: {
							options: { 
								type: 'array', 
								description: 'Array of options for the dropdown',
								items: {
									type: 'object',
									properties: {
										value: { type: 'string', description: 'Option value' },
										text: { type: 'string', description: 'Option display text' }
									}
								}
							},
							elementId: { type: 'string', description: 'Optional ID of the element to append to (defaults to .content)' },
							selectId: { type: 'string', description: 'Optional ID for the select element' },
							className: { type: 'string', description: 'Optional CSS class for the select element' },
						},
						required: ['options']
					},
				},
				{
					type: 'function',
					name: 'changeElementOrder',
					description: 'Changes the order of elements on the page',
					parameters: {
						type: 'object',
						properties: {
							elementIds: { 
								type: 'array', 
								description: 'Array of element IDs in the desired order',
								items: { type: 'string' }
							}
						},
						required: ['elementIds']
					},
				},
				{
					type: 'function',
					name: 'changeTextStyle',
					description: 'Changes the style of text in an element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { type: 'string', description: 'ID of the element to style' },
							styles: { 
								type: 'object',
								description: 'Style properties to apply',
								properties: {
									fontSize: { type: 'string', description: 'Font size (e.g., "16px", "1.2em")' },
									fontWeight: { type: 'string', description: 'Font weight (e.g., "bold", "400")' },
									textAlign: { type: 'string', description: 'Text alignment (e.g., "left", "center", "right")' },
									fontFamily: { type: 'string', description: 'Font family' },
									fontStyle: { type: 'string', description: 'Font style (e.g., "italic")' },
									textDecoration: { type: 'string', description: 'Text decoration (e.g., "underline")' },
									lineHeight: { type: 'string', description: 'Line height' },
									letterSpacing: { type: 'string', description: 'Letter spacing' }
								}
							}
						},
						required: ['elementId', 'styles']
					},
				},
				// New positioning tools
				{
					type: 'function',
					name: 'insertElementBefore',
					description: 'Inserts a new element before a target element',
					parameters: {
						type: 'object',
						properties: {
							newElement: {
								type: 'object',
								description: 'The element to insert',
								properties: {
									type: { 
										type: 'string', 
										description: 'Type of element to create (text, button, input)' 
									},
									content: { 
										type: 'string', 
										description: 'Text content for the element' 
									},
									id: { 
										type: 'string', 
										description: 'Optional ID for the new element' 
									},
									className: { 
										type: 'string', 
										description: 'Optional CSS class for the new element' 
									},
									inputType: { 
										type: 'string', 
										description: 'Type of input (for input elements only)' 
									},
									placeholder: { 
										type: 'string', 
										description: 'Placeholder text (for input elements only)' 
									}
								},
								required: ['type']
							},
							targetId: { 
								type: 'string', 
								description: 'ID of the element to insert before' 
							}
						},
						required: ['newElement', 'targetId']
					}
				},
				{
					type: 'function',
					name: 'insertElementAfter',
					description: 'Inserts a new element after a target element',
					parameters: {
						type: 'object',
						properties: {
							newElement: {
								type: 'object',
								description: 'The element to insert',
								properties: {
									type: { 
										type: 'string', 
										description: 'Type of element to create (text, button, input)' 
									},
									content: { 
										type: 'string', 
										description: 'Text content for the element' 
									},
									id: { 
										type: 'string', 
										description: 'Optional ID for the new element' 
									},
									className: { 
										type: 'string', 
										description: 'Optional CSS class for the new element' 
									},
									inputType: { 
										type: 'string', 
										description: 'Type of input (for input elements only)' 
									},
									placeholder: { 
										type: 'string', 
										description: 'Placeholder text (for input elements only)' 
									}
								},
								required: ['type']
							},
							targetId: { 
								type: 'string', 
								description: 'ID of the element to insert after' 
							}
						},
						required: ['newElement', 'targetId']
					}
				},
				{
					type: 'function',
					name: 'moveElement',
					description: 'Moves an existing element to a new position relative to another element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to move' 
							},
							targetId: { 
								type: 'string', 
								description: 'ID of the target element' 
							},
							position: { 
								type: 'string', 
								description: 'Position relative to target: "before", "after", "prepend" (as first child), or "append" (as last child)' 
							}
						},
						required: ['elementId', 'targetId', 'position']
					}
				},
				{
					type: 'function',
					name: 'deleteElement',
					description: 'Deletes an element from the page',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to delete' 
							}
						},
						required: ['elementId']
					}
				},
				{
					type: 'function',
					name: 'listPageElements',
					description: 'Lists all elements with IDs on the page',
				},
				{
					type: 'function',
					name: 'getElementInfo',
					description: 'Gets information about a specific element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to get information about' 
							}
						},
						required: ['elementId']
					}
				},
				{
					type: 'function',
					name: 'formatTextContent',
					description: 'Formats text content in an element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to format' 
							},
							format: { 
								type: 'string', 
								description: 'Format type: bold, italic, underline for selections; align-left, align-center, align-right, align-justify, color-[value], size-[value] for whole elements' 
							},
							selection: { 
								type: 'object', 
								description: 'Selection range (only required for bold, italic, underline)',
								properties: {
									start: { 
										type: 'integer', 
										description: 'Start index of selection' 
									},
									end: { 
										type: 'integer', 
										description: 'End index of selection' 
									}
								},
								required: ['start', 'end']
							}
						},
						required: ['elementId', 'format']
					}
				},
				// New responsive layout tools
				{
					type: 'function',
					name: 'createLayoutContainer',
					description: 'Creates a container with either grid or flexbox layout',
					parameters: {
						type: 'object',
						properties: {
							containerId: { type: 'string', description: 'Optional ID for the container' },
							type: { type: 'string', description: 'Layout type: "grid" or "flex"' },
							elementId: { type: 'string', description: 'Optional ID of the parent element to append to (defaults to .content)' }
						},
						required: ['type']
					}
				},
				{
					type: 'function',
					name: 'createColumnLayout',
					description: 'Creates a responsive column-based layout',
					parameters: {
						type: 'object',
						properties: {
							containerId: { type: 'string', description: 'ID of the container to convert to columns' },
							columns: { 
								type: 'integer', 
								description: 'Number of columns in the default view'
							},
							gap: { type: 'string', description: 'Space between columns (e.g., "20px")' },
							breakpoints: { 
								type: 'array',
								description: 'Array of responsive breakpoints and column configurations',
								items: {
									type: 'object',
									properties: {
										maxWidth: { type: 'string', description: 'Maximum screen width for this breakpoint (e.g., "768px")' },
										columns: { type: 'integer', description: 'Number of columns at this breakpoint' }
									}
								}
							}
						},
						required: ['containerId', 'columns']
					}
				},
				{
					type: 'function',
					name: 'createGridLayout',
					description: 'Sets up a complex grid layout system',
					parameters: {
						type: 'object',
						properties: {
							containerId: { type: 'string', description: 'ID of the container to make a grid' },
							rows: { 
								type: ['integer', 'array', 'string'], 
								description: 'Number of rows, array of row heights, or template string'
							},
							columns: { 
								type: ['integer', 'array', 'string'], 
								description: 'Number of columns, array of column widths, or template string'
							},
							areas: { 
								type: 'array',
								description: 'Template strings for named grid areas',
								items: { type: 'string' }
							},
							gap: { type: 'string', description: 'Space between grid cells (e.g., "10px" or "10px 20px")' }
						},
						required: ['containerId']
					}
				},
				{
					type: 'function',
					name: 'addElementToLayout',
					description: 'Places an element at a specific position in a layout container',
					parameters: {
						type: 'object',
						properties: {
							element: { 
								type: 'object',
								description: 'Element to add to the layout',
								properties: {
									type: { type: 'string', description: 'Element type: text, div, heading, button, image, or custom' },
									content: { type: 'string', description: 'Text content of the element' },
									id: { type: 'string', description: 'Optional ID for the element' },
									className: { type: 'string', description: 'Optional CSS classes' },
									styles: { type: 'object', description: 'Optional inline styles to apply' },
									level: { type: 'integer', description: 'Heading level (for heading type)' },
									src: { type: 'string', description: 'Image source URL (for image type)' },
									alt: { type: 'string', description: 'Image alt text (for image type)' },
									tagName: { type: 'string', description: 'Custom element tag name (for custom type)' }
								},
								required: ['type']
							},
							containerId: { type: 'string', description: 'ID of the layout container' },
							position: { 
								type: 'object',
								description: 'Position in the layout (grid or flex)',
								properties: {
									// Grid position properties
									row: { type: 'string', description: 'Grid row position (e.g., "1" or "1 / span 2")' },
									column: { type: 'string', description: 'Grid column position (e.g., "1" or "1 / span 3")' },
									area: { type: 'string', description: 'Named grid area to place element in' },
									// Flex position properties
									order: { type: 'integer', description: 'Order of the flex item' },
									grow: { type: 'number', description: 'Flex grow factor' },
									shrink: { type: 'number', description: 'Flex shrink factor' },
									basis: { type: 'string', description: 'Flex basis value' }
								}
							}
						},
						required: ['element', 'containerId']
					}
				},
				{
					type: 'function',
					name: 'setResponsiveRules',
					description: 'Adds media queries for responsive behavior to an element',
					parameters: {
						type: 'object',
						properties: {
							elementId: { type: 'string', description: 'ID of the element to apply responsive rules to' },
							rules: { 
								type: 'array',
								description: 'Array of responsive rules',
								items: {
									type: 'object',
									properties: {
										maxWidth: { type: 'string', description: 'Maximum screen width for this rule (e.g., "768px")' },
										minWidth: { type: 'string', description: 'Minimum screen width for this rule (e.g., "992px")' },
										media: { type: 'string', description: 'Custom media query' },
										styles: { 
											type: 'object',
											description: 'Styles to apply at this breakpoint',
											additionalProperties: true
										}
									}
								}
							}
						},
						required: ['elementId', 'rules']
					}
				},
				// Image generation tools
				{
					type: 'function',
					name: 'generateImage',
					description: 'Generates an image using AI based on a text prompt',
					parameters: {
						type: 'object',
						properties: {
							prompt: { 
								type: 'string', 
								description: 'A text description of the image you want to generate' 
							},
							size: { 
								type: 'string', 
								description: 'Image size - "1024x1024" (default), "1024x1792", or "1792x1024"' 
							},
							quality: { 
								type: 'string', 
								description: 'Image quality - "standard" (default) or "hd"' 
							},
							style: { 
								type: 'string', 
								description: 'Image style - "vivid" (default) or "natural"' 
							},
							elementId: { 
								type: 'string', 
								description: 'ID of the element to append the image to (defaults to .content)' 
							}
						},
						required: ['prompt']
					}
				},
				{
					type: 'function',
					name: 'createImagePlaceholder',
					description: 'Creates a placeholder for an image with custom text',
					parameters: {
						type: 'object',
						properties: {
							text: { 
								type: 'string', 
								description: 'Text to display in the placeholder' 
							},
							width: { 
								type: 'string', 
								description: 'Width of the placeholder (e.g., "300px")' 
							},
							height: { 
								type: 'string', 
								description: 'Height of the placeholder (e.g., "200px")' 
							},
							elementId: { 
								type: 'string', 
								description: 'ID of the element to append the placeholder to (defaults to .content)' 
							}
						}
					}
				},
			],
		},
	};
	dataChannel.send(JSON.stringify(event));
}

dataChannel.addEventListener('open', (ev) => {
	console.log('Opening data channel', ev);
	configureData();
});

// {
//     "type": "response.function_call_arguments.done",
//     "event_id": "event_Ad2gt864G595umbCs2aF9",
//     "response_id": "resp_Ad2griUWUjsyeLyAVtTtt",
//     "item_id": "item_Ad2gsxA84w9GgEvFwW1Ex",
//     "output_index": 1,
//     "call_id": "call_PG12S5ER7l7HrvZz",
//     "name": "get_weather",
//     "arguments": "{\"location\":\"Portland, Oregon\"}"
// }

dataChannel.addEventListener('message', async (ev) => {
	const msg = JSON.parse(ev.data);
	// Handle function calls
	if (msg.type === 'response.function_call_arguments.done') {
		const fn = fns[msg.name];
		if (fn !== undefined) {
			console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
			const args = JSON.parse(msg.arguments);
			const result = await fn(args);
			console.log('result', result);
			// Let OpenAI know that the function has been called and share it's output
			const event = {
				type: 'conversation.item.create',
				item: {
					type: 'function_call_output',
					call_id: msg.call_id, // call_id from the function_call message
					output: JSON.stringify(result), // result of the function
				},
			};
			dataChannel.send(JSON.stringify(event));
			// Have assistant respond after getting the results
			dataChannel.send(JSON.stringify({type:"response.create"}));
		}
	}
});

// Capture microphone
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
	// Add microphone to PeerConnection
	stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: 'sendrecv' }));

	peerConnection.createOffer().then((offer) => {
		peerConnection.setLocalDescription(offer);
		fetch('/session')
			.then((tokenResponse) => tokenResponse.json())
			.then((data) => {
				const EPHEMERAL_KEY = data.result.client_secret.value;
				const baseUrl = 'https://api.openai.com/v1/realtime';
				const model = 'gpt-4o-realtime-preview-2024-12-17';
				fetch(`${baseUrl}?model=${model}`, {
					method: 'POST',
					body: offer.sdp,
					headers: {
						Authorization: `Bearer ${EPHEMERAL_KEY}`,
						'Content-Type': 'application/sdp',
					},
				})
					.then((r) => r.text())
					.then((answer) => {
						// Accept answer from Realtime WebRTC API
						peerConnection.setRemoteDescription({
							sdp: answer,
							type: 'answer',
						});
					});
			});

		// Send WebRTC Offer to Workers Realtime WebRTC API Relay
	});
});

// Add this helper function at the beginning of the script
function generateUniqueId(prefix = 'element') {
	const timestamp = new Date().getTime();
	const random = Math.floor(Math.random() * 10000);
	return `${prefix}-${timestamp}-${random}`;
}

// Add a global style processor that runs periodically to detect and process style tags
function processStyleTags() {
	// Get all style tags in the document
	const styleElements = document.querySelectorAll('style');
	
	styleElements.forEach(styleEl => {
		const styleContent = styleEl.textContent || '';
		
		// Parse the style tag to extract ID and style properties
		const styleRegex = /#([a-zA-Z0-9-_]+)\s*{([^}]*)}/g;
		let match;
		
		while ((match = styleRegex.exec(styleContent)) !== null) {
			const targetId = match[1];
			const styleText = match[2];
			const element = document.getElementById(targetId);
			
			if (element) {
				// Apply styles directly to the element instead of using a style tag
				styleText.split(';').forEach(prop => {
					const [key, value] = prop.split(':').map(s => s.trim());
					if (key && value) {
						// Apply each style property directly to the element's style
						element.style[key] = value;
					}
				});
			}
		}
		
		// Remove the style element as we've processed it
		styleEl.remove();
	});
}

// Run the style processor on a regular interval
setInterval(processStyleTags, 100); // Run every 100ms

// Add a utility function to preprocess text content before it's added
function preprocessTextContent(content) {
	// Check if the content contains style tags
	if (typeof content === 'string' && (content.includes('<style') || content.includes('</style>'))) {
		// Create a temporary container
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = content;
		
		// Find all style tags
		const styleTags = tempDiv.querySelectorAll('style');
		
		// Process each style tag
		styleTags.forEach(styleTag => {
			const styleContent = styleTag.textContent || '';
			
			// Extract styles and apply them directly
			const styleRegex = /#([a-zA-Z0-9-_]+)\s*{([^}]*)}/g;
			let match;
			
			while ((match = styleRegex.exec(styleContent)) !== null) {
				const targetId = match[1];
				const styleText = match[2];
				
				// Apply the style to the target element if it exists
				setTimeout(() => {
					const element = document.getElementById(targetId);
					if (element) {
						styleText.split(';').forEach(prop => {
							const [key, value] = prop.split(':').map(s => s.trim());
							if (key && value) {
								element.style[key] = value;
							}
						});
					}
				}, 0); // Use setTimeout to ensure the element exists
			}
			
			// Remove the style tag
			styleTag.remove();
		});
		
		// Return the content without style tags
		return tempDiv.innerHTML;
	}
	
	// If no style tags, return the original content
	return content;
}

// Modify existing functions to use the preprocessor
const originalAddText = fns.addText;
fns.addText = ({ text, elementId }) => {
	// Preprocess the text content
	const processedText = preprocessTextContent(text);
	
	// Call the original function with the processed text
	return originalAddText({ text: processedText, elementId });
};
