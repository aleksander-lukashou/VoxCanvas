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
	
	parseAndAddHTML: ({ html, elementId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		// Create a temporary container
		const tempContainer = document.createElement('div');
		tempContainer.innerHTML = html;
		
		// Extract style tags and apply styles properly
		const styleElements = tempContainer.querySelectorAll('style');
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
					const styleProps = {};
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
		
		// Move all remaining child nodes from the temporary container to the target element
		while (tempContainer.firstChild) {
			targetElement.appendChild(tempContainer.firstChild);
		}
		
		return { success: true, elementId };
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
	// Add image generation function
	generateImage: async ({ prompt, model, elementId, size, quality }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		try {
			// Make a request to the backend which will interface with OpenAI
			const response = await fetch('/generate-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt,
					model: model || 'dall-e-3',
					size: size || '512x512',
					quality: quality || 'standard',
				}),
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				return { 
					success: false, 
					error: errorData.error || 'Failed to generate image'
				};
			}
			
			const data = await response.json();
			
			// Create an image element with the generated image URL
			const img = document.createElement('img');
			img.src = data.imageUrl;
			img.alt = prompt;
			
			// Ensure the image has an ID
			const imageId = generateUniqueId('image');
			img.id = imageId;
			
			// Add basic styling
			img.style.maxWidth = '100%';
			img.style.height = 'auto';
			img.style.display = 'block';
			img.style.margin = '10px 0';
			
			// Add the image to the target element
			targetElement.appendChild(img);
			
			return { 
				success: true, 
				imageId: imageId,
				prompt: prompt,
				imageUrl: data.imageUrl
			};
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred during image generation'
			};
		}
	},
	
	// Add image resize function
	resizeImage: ({ imageId, width, height, maintainAspectRatio }) => {
		const image = document.getElementById(imageId);
		if (!image || image.tagName.toLowerCase() !== 'img') {
			return { success: false, error: 'Image not found or element is not an image' };
		}
		
		try {
			// If maintainAspectRatio is true or not specified, only set one dimension
			if (maintainAspectRatio !== false) {
				if (width) {
					image.style.width = typeof width === 'number' ? `${width}px` : width;
					image.style.height = 'auto';
				} else if (height) {
					image.style.height = typeof height === 'number' ? `${height}px` : height;
					image.style.width = 'auto';
				} else {
					return { success: false, error: 'Either width or height must be specified' };
				}
			} else {
				// Set both dimensions independently
				if (width) image.style.width = typeof width === 'number' ? `${width}px` : width;
				if (height) image.style.height = typeof height === 'number' ? `${height}px` : height;
			}
			
			return { 
				success: true, 
				imageId: imageId,
				newWidth: image.style.width,
				newHeight: image.style.height
			};
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred while resizing the image'
			};
		}
	},
	
	// Add image alignment function
	alignImage: ({ imageId, alignment, margin }) => {
		const image = document.getElementById(imageId);
		if (!image || image.tagName.toLowerCase() !== 'img') {
			return { success: false, error: 'Image not found or element is not an image' };
		}
		
		try {
			// Reset existing alignment styles
			image.style.display = 'block';
			image.style.marginLeft = '';
			image.style.marginRight = '';
			image.style.float = '';
			
			// Apply specified margin if provided
			const marginValue = margin || '10px';
			
			// Apply the requested alignment
			switch (alignment) {
				case 'left':
					image.style.float = 'left';
					image.style.marginRight = marginValue;
					image.style.marginBottom = marginValue;
					break;
				case 'right':
					image.style.float = 'right';
					image.style.marginLeft = marginValue;
					image.style.marginBottom = marginValue;
					break;
				case 'center':
					image.style.marginLeft = 'auto';
					image.style.marginRight = 'auto';
					break;
				case 'inline-start':
					image.style.display = 'inline-block';
					image.style.verticalAlign = 'middle';
					image.style.marginRight = marginValue;
					break;
				case 'inline-end':
					image.style.display = 'inline-block';
					image.style.verticalAlign = 'middle';
					image.style.marginLeft = marginValue;
					break;
				case 'none':
					// Remove all alignment styles
					break;
				default:
					return { success: false, error: 'Unsupported alignment value. Use "left", "right", "center", "inline-start", "inline-end", or "none"' };
			}
			
			return { 
				success: true, 
				imageId: imageId,
				alignment: alignment
			};
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred while aligning the image'
			};
		}
	},
	
	// Add image delete function
	deleteImage: ({ imageId, fadeOut }) => {
		const image = document.getElementById(imageId);
		if (!image || image.tagName.toLowerCase() !== 'img') {
			return { success: false, error: 'Image not found or element is not an image' };
		}
		
		try {
			// If fadeOut is true, animate the image opacity before removing
			if (fadeOut) {
				// Set transition for smooth fade out
				image.style.transition = 'opacity 0.5s ease';
				image.style.opacity = '0';
				
				// Wait for the transition to complete before removing the element
				setTimeout(() => {
					image.remove();
				}, 500);
				
				return { 
					success: true, 
					imageId: imageId,
					animated: true
				};
			} else {
				// Remove the image immediately
				image.remove();
				
				return { 
					success: true, 
					imageId: imageId,
					animated: false
				};
			}
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred while deleting the image'
			};
		}
	},
	
	// Add grid creation function
	createGrid: ({ elementId, columns, rows, gap, responsiveBreakpoints, gridContainerId }) => {
		const targetElement = elementId ? document.getElementById(elementId) : document.querySelector('.content');
		if (!targetElement) {
			return { success: false, error: 'Target element not found' };
		}
		
		try {
			// Create a container for the grid
			const gridContainer = document.createElement('div');
			const gridId = gridContainerId || generateUniqueId('grid');
			gridContainer.id = gridId;
			
			// Set up grid layout styles
			gridContainer.style.display = 'grid';
			
			// Set columns
			if (columns) {
				if (typeof columns === 'number') {
					// If columns is a number, create equal-width columns
					gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
				} else if (Array.isArray(columns)) {
					// If columns is an array, use the specified sizes
					gridContainer.style.gridTemplateColumns = columns.join(' ');
				} else {
					// If columns is a string, use it directly
					gridContainer.style.gridTemplateColumns = columns;
				}
			} else {
				// Default to 2 columns
				gridContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
			}
			
			// Set rows if specified
			if (rows) {
				if (typeof rows === 'number') {
					gridContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
				} else if (Array.isArray(rows)) {
					gridContainer.style.gridTemplateRows = rows.join(' ');
				} else {
					gridContainer.style.gridTemplateRows = rows;
				}
			}
			
			// Set gap between grid items
			if (gap) {
				if (typeof gap === 'string') {
					gridContainer.style.gap = gap;
				} else if (typeof gap === 'object' && gap.column && gap.row) {
					gridContainer.style.columnGap = gap.column;
					gridContainer.style.rowGap = gap.row;
				} else {
					gridContainer.style.gap = '20px';
				}
			} else {
				gridContainer.style.gap = '20px';
			}
			
			// Add responsive styles using media queries if specified
			if (responsiveBreakpoints && Array.isArray(responsiveBreakpoints)) {
				const styleTag = document.createElement('style');
				let mediaQueries = '';
				
				responsiveBreakpoints.forEach(bp => {
					if (bp.maxWidth && bp.columns) {
						const cols = typeof bp.columns === 'number' 
							? `repeat(${bp.columns}, 1fr)` 
							: bp.columns;
						
						mediaQueries += `
							@media (max-width: ${bp.maxWidth}) {
								#${gridId} {
									grid-template-columns: ${cols};
									${bp.gap ? `gap: ${bp.gap};` : ''}
								}
							}
						`;
					}
				});
				
				styleTag.textContent = mediaQueries;
				document.head.appendChild(styleTag);
			}
			
			// Set additional styles
			gridContainer.style.width = '100%';
			
			// Create empty grid cells based on rows and columns if specified
			const cellCount = (typeof columns === 'number' ? columns : 2) * (typeof rows === 'number' ? rows : 0);
			if (cellCount > 0) {
				for (let i = 0; i < cellCount; i++) {
					const cell = document.createElement('div');
					cell.id = `${gridId}-cell-${i+1}`;
					cell.className = 'grid-cell';
					cell.style.minHeight = '50px';
					cell.style.padding = '10px';
					cell.style.border = '1px dashed #ccc';
					gridContainer.appendChild(cell);
				}
			}
			
			// Add the grid to the target element
			targetElement.appendChild(gridContainer);
			
			return { 
				success: true, 
				gridId: gridId,
				columnsCount: typeof columns === 'number' ? columns : (Array.isArray(columns) ? columns.length : null),
				rowsCount: typeof rows === 'number' ? rows : (Array.isArray(rows) ? rows.length : null)
			};
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred while creating the grid'
			};
		}
	},
	
	// Add grid modification function
	modifyGrid: ({ gridId, columns, rows, gap, addElements, cellStyles }) => {
		const gridContainer = document.getElementById(gridId);
		if (!gridContainer) {
			return { success: false, error: 'Grid container not found' };
		}
		
		try {
			// Update grid columns if specified
			if (columns) {
				if (typeof columns === 'number') {
					gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
				} else if (Array.isArray(columns)) {
					gridContainer.style.gridTemplateColumns = columns.join(' ');
				} else {
					gridContainer.style.gridTemplateColumns = columns;
				}
			}
			
			// Update grid rows if specified
			if (rows) {
				if (typeof rows === 'number') {
					gridContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
				} else if (Array.isArray(rows)) {
					gridContainer.style.gridTemplateRows = rows.join(' ');
				} else {
					gridContainer.style.gridTemplateRows = rows;
				}
			}
			
			// Update gap between grid items if specified
			if (gap) {
				if (typeof gap === 'string') {
					gridContainer.style.gap = gap;
				} else if (typeof gap === 'object' && gap.column && gap.row) {
					gridContainer.style.columnGap = gap.column;
					gridContainer.style.rowGap = gap.row;
				}
			}
			
			// Add elements to specific cells if specified
			if (addElements && Array.isArray(addElements)) {
				addElements.forEach(item => {
					const cellIndex = item.cellIndex;
					const content = item.content;
					const cellId = item.cellId || `${gridId}-cell-${cellIndex}`;
					
					// Find the cell or create it if it doesn't exist
					let cell = document.getElementById(cellId);
					if (!cell) {
						cell = document.createElement('div');
						cell.id = cellId;
						cell.className = 'grid-cell';
						
						// If cellIndex is provided, try to position it
						if (cellIndex) {
							// Calculate row and column from index
							const currentColumnCount = getComputedStyle(gridContainer).gridTemplateColumns.split(' ').length;
							if (currentColumnCount > 0) {
								const row = Math.ceil(cellIndex / currentColumnCount);
								const column = ((cellIndex - 1) % currentColumnCount) + 1;
								cell.style.gridRow = row;
								cell.style.gridColumn = column;
							}
						}
						
						gridContainer.appendChild(cell);
					}
					
					// Add content to the cell
					if (content) {
						if (typeof content === 'string') {
							cell.innerHTML = content;
						} else if (typeof content === 'object') {
							// For more complex content, create and add the specified elements
							if (content.type === 'text') {
								const p = document.createElement('p');
								p.textContent = content.text;
								cell.appendChild(p);
							} else if (content.type === 'image') {
								const img = document.createElement('img');
								img.src = content.src;
								img.alt = content.alt || '';
								img.style.maxWidth = '100%';
								cell.appendChild(img);
							} else if (content.type === 'button') {
								const button = document.createElement('button');
								button.textContent = content.text;
								cell.appendChild(button);
							}
						}
					}
				});
			}
			
			// Apply styles to specific cells if specified
			if (cellStyles && Array.isArray(cellStyles)) {
				cellStyles.forEach(style => {
					const cellId = style.cellId;
					const cellIndex = style.cellIndex;
					
					// Find the cell by ID or index
					let cell;
					if (cellId) {
						cell = document.getElementById(cellId);
					} else if (cellIndex) {
						cell = document.querySelector(`#${gridId} > :nth-child(${cellIndex})`);
					}
					
					// Apply styles if the cell exists
					if (cell && style.styles) {
						Object.entries(style.styles).forEach(([key, value]) => {
							cell.style[key] = value;
						});
					}
				});
			}
			
			return { 
				success: true, 
				gridId: gridId
			};
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred while modifying the grid'
			};
		}
	},
	
	// Add grid deletion function
	deleteGrid: ({ gridId, fadeOut }) => {
		const gridContainer = document.getElementById(gridId);
		if (!gridContainer) {
			return { success: false, error: 'Grid container not found' };
		}
		
		try {
			// If fadeOut is true, animate the grid opacity before removing
			if (fadeOut) {
				// Set transition for smooth fade out
				gridContainer.style.transition = 'opacity 0.5s ease';
				gridContainer.style.opacity = '0';
				
				// Wait for the transition to complete before removing the element
				setTimeout(() => {
					gridContainer.remove();
				}, 500);
				
				return { 
					success: true, 
					gridId: gridId,
					animated: true
				};
			} else {
				// Remove the grid immediately
				gridContainer.remove();
				
				return { 
					success: true, 
					gridId: gridId,
					animated: false
				};
			}
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'An error occurred while deleting the grid'
			};
		}
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
	}
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
					name: 'parseAndAddHTML',
					description: 'Parses and adds HTML content to the page',
					parameters: {
						type: 'object',
						properties: {
							html: { 
								type: 'string', 
								description: 'HTML content to add to the page' 
							},
							elementId: { 
								type: 'string', 
								description: 'Optional ID of the element to append to (defaults to .content)' 
							}
						},
						required: ['html']
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
				// Add image generation tool
				{
					type: 'function',
					name: 'generateImage',
					description: 'Generates an image using DALL-E AI and adds it to the page',
					parameters: {
						type: 'object',
						properties: {
							prompt: { 
								type: 'string', 
								description: 'Detailed description of the image to generate' 
							},
							model: { 
								type: 'string', 
								description: 'AI model to use for image generation (default: dall-e-3)' 
							},
							elementId: { 
								type: 'string', 
								description: 'Optional ID of the element to append the image to (defaults to .content)' 
							},
							size: { 
								type: 'string', 
								description: 'Image size (default: 1024x1024). Options: 1024x1024, 1024x1792, 1792x1024' 
							},
							quality: { 
								type: 'string', 
								description: 'Image quality (default: standard). Options: standard, hd' 
							}
						},
						required: ['prompt']
					}
				},
				// Add image resize tool
				{
					type: 'function',
					name: 'resizeImage',
					description: 'Resizes an existing image on the page',
					parameters: {
						type: 'object',
						properties: {
							imageId: { 
								type: 'string', 
								description: 'ID of the image element to resize' 
							},
							width: { 
								type: 'string', 
								description: 'New width for the image (e.g., "500px", "50%")' 
							},
							height: { 
								type: 'string', 
								description: 'New height for the image (e.g., "300px", "auto")' 
							},
							maintainAspectRatio: { 
								type: 'boolean', 
								description: 'Whether to maintain the aspect ratio (default: true)' 
							}
						},
						required: ['imageId']
					}
				},
				// Add image alignment tool
				{
					type: 'function',
					name: 'alignImage',
					description: 'Aligns an existing image on the page',
					parameters: {
						type: 'object',
						properties: {
							imageId: { 
								type: 'string', 
								description: 'ID of the image element to align' 
							},
							alignment: { 
								type: 'string', 
								description: 'Alignment type: left, right, center, inline-start, inline-end, or none' 
							},
							margin: { 
								type: 'string', 
								description: 'Margin around the image (e.g., "10px")' 
							}
						},
						required: ['imageId', 'alignment']
					}
				},
				// Add image delete tool
				{
					type: 'function',
					name: 'deleteImage',
					description: 'Deletes an existing image from the page',
					parameters: {
						type: 'object',
						properties: {
							imageId: { 
								type: 'string', 
								description: 'ID of the image element to delete' 
							},
							fadeOut: { 
								type: 'boolean', 
								description: 'Whether to animate the deletion (default: true)' 
							}
						},
						required: ['imageId']
					}
				},
				// Add grid creation tool
				{
					type: 'function',
					name: 'createGrid',
					description: 'Creates a new grid on the page',
					parameters: {
						type: 'object',
						properties: {
							elementId: { 
								type: 'string', 
								description: 'ID of the element to append the grid to (defaults to .content)' 
							},
							columns: { 
								type: 'string', 
								description: 'Number of columns in the grid' 
							},
							rows: { 
								type: 'string', 
								description: 'Number of rows in the grid' 
							},
							gap: { 
								type: 'string', 
								description: 'Gap between grid items' 
							},
							responsiveBreakpoints: { 
								type: 'array', 
								description: 'Array of responsive breakpoints' 
							},
							gridContainerId: { 
								type: 'string', 
								description: 'Optional ID for the grid container' 
							}
						},
						required: ['elementId']
					}
				},
				// Add grid modification tool
				{
					type: 'function',
					name: 'modifyGrid',
					description: 'Modifies an existing grid on the page',
					parameters: {
						type: 'object',
						properties: {
							gridId: { 
								type: 'string', 
								description: 'ID of the grid to modify' 
							},
							columns: { 
								type: 'string', 
								description: 'Number of columns in the grid' 
							},
							rows: { 
								type: 'string', 
								description: 'Number of rows in the grid' 
							},
							gap: { 
								type: 'string', 
								description: 'Gap between grid items' 
							},
							addElements: { 
								type: 'array', 
								description: 'Array of elements to add to the grid' 
							},
							cellStyles: { 
								type: 'array', 
								description: 'Array of styles to apply to specific cells' 
							}
						},
						required: ['gridId']
					}
				},
				// Add grid deletion tool
				{
					type: 'function',
					name: 'deleteGrid',
					description: 'Deletes an existing grid from the page',
					parameters: {
						type: 'object',
						properties: {
							gridId: { 
								type: 'string', 
								description: 'ID of the grid to delete' 
							},
							fadeOut: { 
								type: 'boolean', 
								description: 'Whether to animate the deletion (default: true)' 
							}
						},
						required: ['gridId']
					}
				}
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

// Override parseAndAddHTML to use the preprocessor
const originalParseAndAddHTML = fns.parseAndAddHTML;
fns.parseAndAddHTML = ({ html, elementId }) => {
	// Preprocess the HTML content
	const processedHTML = preprocessTextContent(html);
	
	// Call the original function with the processed HTML
	return originalParseAndAddHTML({ html: processedHTML, elementId });
};
